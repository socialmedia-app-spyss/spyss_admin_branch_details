import { supabaseClient } from "../supabaseClient";
import { UserProfile } from "../types/user"; // Import UserProfile type

export const authProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error };

    return { success: true, redirectTo: "/dashboard" };
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

    if (userProfile.status !== "APPROVED" || !userProfile.is_active) {
      return {
        authenticated: false,
        redirectTo: "/access-denied",
        // Removed error property as per Refine's AuthProvider expectation
      };
    }

    if (userProfile.role === "USER") {
      return {
        authenticated: false,
        redirectTo: "/access-denied",
        // Removed error property as per Refine's AuthProvider expectation
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
      console.error("getIdentity: Error fetching user profile:", profileError);
      return null;
    }

    const mergedIdentity = {
      ...authData.user,
      ...profile, // Merge profile data with auth user data
    };

    return mergedIdentity;
  },
  register: async ({ email, password, full_name }: { email: string; password: string; full_name: string }) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name, // Store full_name in user metadata
        },
      },
    });

    if (error) {
      console.error("Register: Supabase auth.signUp error:", error);
      return { success: false, error };
    }

    // After successful auth.signUp, create a profile entry in 'user_profiles' table
    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from("user_profiles")
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: full_name, // Store full_name here
            role: "USER", // Default role
            status: "PENDING", // Default status
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.error("Register: Error creating user profile in user_profiles table:", profileError);
        // Optionally, you might want to roll back the auth.signUp or handle this error differently
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
    const identity = await authProvider.getIdentity();
    const userRole = (identity as UserProfile)?.role;

    if (resource === "users") {
      // Only SUPER_ADMIN can list, show, create, edit, delete users
      return { can: userRole === "SUPER_ADMIN" };
    }

    // Default to allowing access if no specific rule is defined
    return { can: true };
  },
  onError: async (error: Error) => {
    console.error("Auth Provider Error:", error);
    return { error };
  },
};
