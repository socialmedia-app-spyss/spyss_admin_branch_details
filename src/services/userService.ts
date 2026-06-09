import { supabaseClient } from "../supabaseClient"; // Corrected path
import { UserProfile } from "../types/user";

export const userService = {
  getAll: async () => {
    return supabaseClient.from("user_profiles").select("*");
  },

  approveUser: async (id: string, adminId?: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({
        status: "ACTIVE",
        approved_at: new Date().toISOString(),
        approved_by: adminId ?? null,
      })
      .eq("id", id);
  },

  rejectUser: async (id: string, adminId?: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({
        status: "REJECTED",
        approved_at: null,
        approved_by: adminId ?? null,
      })
      .eq("id", id);
  },

  makeAdmin: async (id: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({ role: "ADMIN" })
      .eq("id", id);
  },

  makeUser: async (id: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({ role: "USER" })
      .eq("id", id);
  },
};