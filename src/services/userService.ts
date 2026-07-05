import { supabaseClient } from "../supabaseClient"; // Corrected path
import type { UserStatus } from "../types/user";

export const userService = {
  getAll: async () => {
    return supabaseClient.from("user_profiles").select("*");
  },

  approveUser: async (id: string, adminId?: string) => {
    return userService.updateStatus(id, "APPROVED", adminId);
  },

  updateStatus: async (id: string, status: UserStatus, adminId?: string) => {
    const approvalFields =
      status === "APPROVED"
        ? {
            approved_at: new Date().toISOString(),
            approved_by: adminId ?? null,
          }
        : status === "REJECTED"
          ? {
              approved_at: null,
              approved_by: adminId ?? null,
            }
          : status === "PENDING"
            ? {
                approved_at: null,
                approved_by: null,
              }
            : {};

    return supabaseClient
      .from("user_profiles")
      .update({
        status,
        ...approvalFields,
      })
      .eq("id", id);
  },

  rejectUser: async (id: string, adminId?: string) => {
    return userService.updateStatus(id, "REJECTED", adminId);
  },

  makeAdmin: async (id: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({
        role: "SUPER_ADMIN",
        state_id: null,
        district_id: null,
        valaya_id: null,
        branch_id: null,
      })
      .eq("id", id);
  },

  makeUser: async (id: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({ role: "USER" })
      .eq("id", id);
  },
};
