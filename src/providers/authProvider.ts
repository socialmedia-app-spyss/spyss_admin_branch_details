import { supabaseClient } from "../supabaseClient";
import { UserProfile } from "../types/user";
import { getValayaScopeForUser, type ValayaScopeRow } from "../services/valayaScope";

type AdminRole =
  | "SUPER_ADMIN"
  | "STATE_ADMIN"
  | "DISTRICT_ADMIN"
  | "VALAYA_ADMIN"
  | "BRANCH_ADMIN"
  | "PANCHANGA_ADMIN";

type AppRole = AdminRole | "USER";

type ExtendedIdentity = UserProfile & {
  name: string;
  valaya_code?: string | null;
  valaya_name?: string | null;
  accessible_valaya_rows?: ValayaScopeRow[];
  accessible_valaya_ids?: string[];
  accessible_district_ids?: string[];
};

const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "STATE_ADMIN",
  "DISTRICT_ADMIN",
  "VALAYA_ADMIN",
  "BRANCH_ADMIN",
  "PANCHANGA_ADMIN",
];

const VALAYA_ADMIN_RESOURCES = [
  "dashboard",
  "branches",
  "latest_branches",
  "activities",
  "enquiries",
  "users",
  "master_districts",
  "master_valayas",
];

const SUPER_ADMIN_ONLY_RESOURCES = ["settings", "master_states", "notifications", "events"];
const PANCHANGA_RESOURCES = ["daily_panchanga", "daily_amrutha_vachana"];

// Refine can call check(), getIdentity(), and can() at nearly the same time
// while it resolves the current route. Share one lookup between those callers
// instead of asking Supabase for the same user and profile for each hook.
const IDENTITY_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedIdentity: ExtendedIdentity | null | undefined;
let identityCachedAt = 0;
let identityRequest: Promise<ExtendedIdentity | null> | null = null;
let identityCacheGeneration = 0;

const isIdentityCacheValid = (): boolean =>
  cachedIdentity !== undefined &&
  Date.now() - identityCachedAt < IDENTITY_CACHE_TTL_MS;

const clearIdentityCache = () => {
  identityCacheGeneration += 1;
  cachedIdentity = undefined;
  identityCachedAt = 0;
  identityRequest = null;
};

const getCurrentUserProfile = async (): Promise<ExtendedIdentity | null> => {
  if (isIdentityCacheValid()) {
    return cachedIdentity ?? null;
  }

  if (identityRequest) {
    return identityRequest;
  }

  const requestGeneration = identityCacheGeneration;
  const request = (async (): Promise<ExtendedIdentity | null> => {
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError) {
      // Supabase reports a missing browser session as an Auth error even
      // though this is the normal state on the login page.
      if (authError.name === "AuthSessionMissingError") {
        if (requestGeneration === identityCacheGeneration) {
          cachedIdentity = null;
          identityCachedAt = Date.now();
        }
        return null;
      }

      throw authError;
    }

    if (!user) {
      if (requestGeneration === identityCacheGeneration) {
        cachedIdentity = null;
        identityCachedAt = Date.now();
      }
      return null;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select(`
        id,
        email,
        full_name,
        phone_number,
        role,
        status,
        state_id,
        district_id,
        valaya_id,
        branch_id,
        display_order,
        is_active,
        created_at,
        updated_at,
        approved_by,
        approved_at,
        created_by,
        updated_by
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      throw new Error(`No user profile exists for authenticated user ${user.id}`);
    }

    const userProfile = profile as UserProfile;

    const valayaScope = await getValayaScopeForUser(userProfile);

    const identity: ExtendedIdentity = {
      ...userProfile,
      name: userProfile.full_name,
      valaya_code: valayaScope.valayaCode,
      valaya_name: valayaScope.valayaNameEn,
      accessible_valaya_rows: valayaScope.valayaRows,
      accessible_valaya_ids: valayaScope.valayaRows.map((row) => row.id),
      accessible_district_ids: valayaScope.districtIds,
    };

    if (requestGeneration === identityCacheGeneration) {
      cachedIdentity = identity;
      identityCachedAt = Date.now();
    }

    return identity;
  })();

  identityRequest = request;

  try {
    return await request;
  } catch (error) {
    console.error("getCurrentUserProfile: Identity lookup failed:", error);
    throw error;
  } finally {
    if (identityRequest === request) {
      identityRequest = null;
    }
  }
};

// This module is loaded once, so a single listener invalidates cached identity
// when Supabase changes the session outside the provider's own methods.
supabaseClient.auth.onAuthStateChange((event) => {
  if (
    event === "SIGNED_IN" ||
    event === "SIGNED_OUT" ||
    event === "USER_UPDATED" ||
    event === "PASSWORD_RECOVERY"
  ) {
    clearIdentityCache();
  }
});

export const authProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error };
    }

    clearIdentityCache();
    return { success: true, redirectTo: "/dashboard" };
  },

  logout: async () => {
    try {
      await supabaseClient.auth.signOut();
    } finally {
      clearIdentityCache();
    }
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    try {
      const identity = await getCurrentUserProfile();

      if (!identity) {
        return { authenticated: false, logout: true, redirectTo: "/login" };
      }

      if (identity.status !== "APPROVED" || !identity.is_active) {
        return {
          authenticated: false,
          redirectTo: "/access-denied",
        };
      }

      if (!ADMIN_ROLES.includes(identity.role as AdminRole)) {
        return {
          authenticated: false,
          redirectTo: "/access-denied",
        };
      }

      return { authenticated: true };
    } catch (error) {
      console.error("Authentication check failed:", error);
      return {
        authenticated: false,
        error: error instanceof Error
          ? error
          : new Error("Authentication check failed"),
      };
    }
  },

  getIdentity: async () => {
    return await getCurrentUserProfile();
  },
  register: async ({ email, password, full_name }: { email: string; password: string; full_name: string }) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) {
      console.error("Register: Supabase auth.signUp error:", error);
      return { success: false, error };
    }

    clearIdentityCache();

    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from("user_profiles")
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name,
            role: "USER",
            status: "PENDING",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.error("Register: Error creating user profile in user_profiles table:", profileError);
        return { success: false, error: profileError };
      }
    }

    return { success: true, redirectTo: "/login" };
  },
  forgotPassword: async ({ email }: { email: string }) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) return { success: false, error };
    return { success: true };
  },
  can: async ({ resource, action: _action, params: _params }: { resource?: string; action: string; params?: unknown }) => {
    const identity = await getCurrentUserProfile();

    if (!identity) {
      return { can: false };
    }

    const userRole = identity.role as AppRole;

    if (identity.status !== "APPROVED" || !identity.is_active) {
      return { can: false };
    }

    if (userRole === "USER") {
      return { can: false };
    }

    if (userRole === "SUPER_ADMIN") {
      return { can: true };
    }

    if (userRole === "PANCHANGA_ADMIN") {
      return {
        can: resource === "dashboard" ||
          (resource !== undefined &&
            PANCHANGA_RESOURCES.includes(resource) &&
            _action !== "delete"),
      };
    }

    if (!resource || SUPER_ADMIN_ONLY_RESOURCES.includes(resource)) {
      return { can: false };
    }

    if (userRole === "VALAYA_ADMIN") {
      return { can: VALAYA_ADMIN_RESOURCES.includes(resource) };
    }

    if (userRole === "STATE_ADMIN") {
      return { can: true };
    }

    if (userRole === "DISTRICT_ADMIN") {
      return { can: true };
    }

    if (userRole === "BRANCH_ADMIN") {
      const allowedBranchResources = [
        "dashboard",
        "branches",
        "latest_branches",
        "activities",
        "enquiries",
      ];

      return { can: allowedBranchResources.includes(resource) };
    }

    return { can: false };
  },
  onError: async (error: Error) => {
    console.error("Auth Provider Error:", error);
    return { error };
  },
};
