import { AuthProvider } from "@refinedev/core";
import { supabaseClient } from "./supabase-client";
import { ROLES } from "../types/roles"; // Import ROLES

const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // sign in with oauth
    try {
      if (providerName) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: providerName,
        });

        if (error) {
          return {
            success: false,
            error: {
              message: error.message || "OAuth login failed",
              name: error.name || "OAuthError",
            },
          };
        }

        if (data?.url) {
          return {
            success: true,
            redirectTo: "/dashboard",
          };
        }
      }

      // sign in with email and password
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message || "Login failed",
            name: error.name || "AuthError",
          },
        };
      }

      if (data?.user) {
        return {
          success: true,
          redirectTo: "/dashboard",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: (error as Error).message || "An unexpected error occurred during login",
          name: (error as Error).name || "UnknownError",
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Login failed: Invalid credentials or account not active.",
        name: "LoginError",
      },
    };
  },
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/dashboard",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Register failed",
        name: "Invalid email or password",
      },
    };
  },
  forgotPassword: async ({ email }) => {
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Forgot password failed",
        name: "Invalid email",
      },
    };
  },
  updatePassword: async ({ password }) => {
    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/dashboard",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }
    return {
      success: false,
      error: {
        message: "Update password failed",
        name: "Invalid password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
        };
      }

      const { data: profile, error } = await supabaseClient
        .from("user_profiles")
        .select("role, status") // Fetch status as well
        .eq("id", session.user.id)
        .single();

      if (error || !profile) {
        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
        };
      }

      const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

      // Check both role and status for access
      if (!allowedRoles.includes(profile.role) || profile.status !== "ACTIVE") {
        return {
          authenticated: false,
          redirectTo: "/access-denied",
        };
      }

      return {
        authenticated: true,
      };
    } catch (error: any) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => {
    const { data: authData } = await supabaseClient.auth.getUser();
    const authUser = authData.user;

    if (!authUser) return null;

    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("role, status") // Fetch status
      .eq("id", authUser.id)
      .single();

    // Return role only if it's an allowed role and status is ACTIVE
    const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
    if (profile && allowedRoles.includes(profile.role) && profile.status === "ACTIVE") {
      return profile.role;
    }

    return null;
  },
  getIdentity: async () => {
    const { data: authData } = await supabaseClient.auth.getUser();

    if (!authData.user) return null;

    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("full_name,email,role,status") // Fetch status
      .eq("id", authData.user.id)
      .single();

    return {
      id: authData.user.id,
      name: profile?.full_name ?? authData.user.email,
      email: profile?.email,
      role: profile?.role,
      status: profile?.status, // Include status in identity
    };
  },
};

export default authProvider;