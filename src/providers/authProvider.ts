import { supabaseClient } from "../supabaseClient";
import { UserProfile } from "../types/user";
import { getValayaScopeForUser, type ValayaScopeRow } from "../services/valayaScope";

import {
  ADMIN_ROLES,
  type AdminRole,
  type AppRole,
  checkUserAccess,
} from "./accessControl";

type ExtendedIdentity = UserProfile & {
  name: string;
  valaya_code?: string | null;
  valaya_name?: string | null;
  accessible_valaya_rows?: ValayaScopeRow[];
  accessible_valaya_ids?: string[];
  accessible_district_ids?: string[];
};

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
    const userRole = (userProfile.role || "").trim().toUpperCase() as AppRole;

    let valayaScope: {
      valayaCode: string | null;
      valayaNameEn: string | null;
      valayaNameKn: string | null;
      valayaRows: ValayaScopeRow[];
      districtIds: string[];
    } = {
      valayaCode: null,
      valayaNameEn: null,
      valayaNameKn: null,
      valayaRows: [],
      districtIds: [],
    };

    if (userRole === "VALAYA_ADMIN" && userProfile.valaya_id) {
      valayaScope = await getValayaScopeForUser(userProfile);
    }

    const accessibleValayaIds = Array.from(
      new Set([
        ...(userProfile.valaya_id ? [userProfile.valaya_id] : []),
        ...valayaScope.valayaRows.map((row) => row.id),
      ]),
    );

    const identity: ExtendedIdentity = {
      ...userProfile,
      name: userProfile.full_name,
      valaya_code: valayaScope.valayaCode,
      valaya_name: valayaScope.valayaNameEn,
      accessible_valaya_rows: valayaScope.valayaRows,
      accessible_valaya_ids: accessibleValayaIds,
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

export { checkUserAccess } from "./accessControl";

export const authProvider = {
  login: async ({ email, password }: { email: string; password?: string }) => {
    if (!password) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Password is required",
        },
      };
    }

    clearIdentityCache();

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login: Supabase signInWithPassword error:", error);
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.message,
        },
      };
    }

    try {
      const profile = await getCurrentUserProfile();

      if (!profile) {
        await supabaseClient.auth.signOut();
        clearIdentityCache();
        return {
          success: false,
          error: {
            name: "ProfileError",
            message: "User profile not found",
          },
        };
      }

      const role = (profile.role || "").trim().toUpperCase() as AppRole;
      if (!ADMIN_ROLES.includes(role as AdminRole)) {
        await supabaseClient.auth.signOut();
        clearIdentityCache();
        return {
          success: false,
          error: {
            name: "RoleError",
            message: "You do not have access to the admin panel.",
          },
        };
      }

      if (role !== "SUPER_ADMIN" && (profile.status !== "APPROVED" || !profile.is_active)) {
        await supabaseClient.auth.signOut();
        clearIdentityCache();
        return {
          success: false,
          error: {
            name: "ApprovalError",
            message:
              profile.status === "PENDING"
                ? "Your account is pending administrator approval."
                : "Your account has been rejected or deactivated.",
          },
        };
      }

      return {
        success: true,
        redirectTo: role === "PANCHANGA_ADMIN" ? "/panchanga" : "/dashboard",
      };
    } catch (profileError) {
      console.error("Login: Error during post-auth validation:", profileError);
      await supabaseClient.auth.signOut();
      clearIdentityCache();
      return {
        success: false,
        error: {
          name: "ValidationError",
          message:
            profileError instanceof Error
              ? profileError.message
              : "Failed to validate user permissions",
        },
      };
    }
  },

  logout: async () => {
    clearIdentityCache();
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: error.message,
        },
      };
    }
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    try {
      const profile = await getCurrentUserProfile();

      if (!profile) {
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
        };
      }

      const role = (profile.role || "").trim().toUpperCase() as AppRole;
      if (!ADMIN_ROLES.includes(role as AdminRole)) {
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
          error: new Error("You do not have access to the admin panel."),
        };
      }

      if (role !== "SUPER_ADMIN" && (profile.status !== "APPROVED" || !profile.is_active)) {
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
          error: new Error(
            profile.status === "PENDING"
              ? "Your account is pending administrator approval."
              : "Your account has been deactivated or rejected.",
          ),
        };
      }

      return { authenticated: true };
    } catch (error) {
      console.error("Auth check failed:", error);
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
        error: error instanceof Error ? error : new Error("Authentication failed"),
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

    // Profile creation is performed by the auth.users database trigger. Signup
    // commonly has no authenticated session while email confirmation is pending,
    // so a client-side insert is rejected by the user_profiles RLS policy.

    return { success: true, redirectTo: "/login" };
  },
  forgotPassword: async ({ email }: { email: string }) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) return { success: false, error };
    return { success: true };
  },
  can: async ({ resource, action, params }: { resource?: string; action: string; params?: unknown }) => {
    const identity = await getCurrentUserProfile();
    return checkUserAccess({ identity, resource, action, params });
  },
  onError: async (error: Error) => {
    console.error("Auth Provider Error:", error);
    return { error };
  },
};
