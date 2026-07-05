import { supabaseClient } from "../supabaseClient";
import { UserProfile } from "../types/user";
import { getValayaScopeForUser, type ValayaScopeRow } from "../services/valayaScope";

type AdminRole =
  | "SUPER_ADMIN"
  | "STATE_ADMIN"
  | "DISTRICT_ADMIN"
  | "VALAYA_ADMIN"
  | "BRANCH_ADMIN";

type AppRole = AdminRole | "USER";

type ExtendedIdentity = UserProfile & {
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
];

const VALAYA_ADMIN_RESOURCES = [
  "dashboard",
  "branches",
  "latest_branches",
  "events",
  "activities",
  "enquiries",
  "users",
  "master_districts",
  "master_valayas",
];

const SUPER_ADMIN_ONLY_RESOURCES = ["settings", "master_states"];

const getCurrentUserProfile = async (): Promise<ExtendedIdentity | null> => {
  const { data: authData, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error("getCurrentUserProfile: Error fetching user profile:", profileError);
    return null;
  }

  const userProfile = profile as UserProfile;

  const valayaScope = await getValayaScopeForUser(userProfile);

  return {
    ...authData.user,
    ...userProfile,
    valaya_code: valayaScope.valayaCode,
    valaya_name: valayaScope.valayaName,
    accessible_valaya_rows: valayaScope.valayaRows,
    accessible_valaya_ids: valayaScope.valayaRows.map((row) => row.id),
    accessible_district_ids: valayaScope.districtIds,
  } as ExtendedIdentity;
};

export const authProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, redirectTo: "/dashboard" };
  },

  logout: async () => {
    await supabaseClient.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const identity = await getCurrentUserProfile();

    if (!identity) {
      return { authenticated: false, redirectTo: "/login" };
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
  can: async ({ resource, action: _action, params: _params }: { resource: string; action: string; params: any }) => {
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

    if (SUPER_ADMIN_ONLY_RESOURCES.includes(resource)) {
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
        "events",
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
