import { AuthBindings } from "@refinedev/core";
import { supabaseClient } from "../supabaseClient";
import { UserProfile } from "../types/user"; // Import UserProfile type

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error };

    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    await supabaseClient.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const { data: auth } = await supabaseClient.auth.getUser();

    if (!auth.user) {
      return { authenticated: false, redirectTo: "/login" };
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return { authenticated: false, redirectTo: "/login" };
    }

    // Type assertion for profile
    const userProfile = profile as UserProfile;

    if (userProfile.status !== "ACTIVE") {
      return {
        authenticated: false,
        redirectTo: "/access-denied", // Redirect to a specific access denied page
        error: { message: "Your account is not active." },
      };
    }

    // Example: Deny access to regular 'USER' role for the admin panel
    if (userProfile.role === "USER") {
      return {
        authenticated: false,
        redirectTo: "/access-denied",
        error: { message: "You do not have sufficient permissions to access this panel." },
      };
    }

    return { authenticated: true };
  },

  getIdentity: async () => {
    const { data: authData, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authData.user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile for identity:", profileError);
      return null;
    }

    return {
      ...authData.user,
      ...profile, // Merge profile data with auth user data
    };
  },
  register: async ({ email, password }) => {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (error) return { success: false, error };
    return { success: true, redirectTo: "/login" };
  },
  forgotPassword: async ({ email }) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) return { success: false, error };
    return { success: true };
  },
  // Add the 'can' method for permission control
  can: async ({ resource, action, params }) => {
    const identity = await authProvider.getIdentity();
    const userRole = (identity as UserProfile)?.role;

    if (resource === "users") {
      // Only SUPER_ADMIN can list, show, create, edit, delete users
      return { can: userRole === "SUPER_ADMIN" };
    }

    // Default to allowing access if no specific rule is defined
    return { can: true };
  },
};
