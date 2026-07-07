import { supabaseClient } from "../supabaseClient"; // Corrected path
import type { UserRole, UserStatus } from "../types/user";

type UserScopeUpdate = {
  state_id?: string | null;
  district_id?: string | null;
  valaya_id?: string | null;
  branch_id?: string | null;
};

export const userService = {
  getAll: async () => {
    return supabaseClient.from("user_profiles").select("*");
  },

  approveUser: async (id: string, adminId?: string) => {
    return userService.updateStatus(id, "APPROVED", adminId);
  },

  approveUserWithRole: async (
    id: string,
    role: UserRole,
    adminId?: string,
    scope: UserScopeUpdate = {},
  ) => {
    const scopeUpdates =
      role === "VALAYA_ADMIN"
        ? {
            district_id: null,
            branch_id: null,
            ...scope,
          }
        : role === "STATE_ADMIN"
          ? {
              district_id: null,
              valaya_id: null,
              branch_id: null,
              ...scope,
            }
        : role === "DISTRICT_ADMIN"
          ? {
              valaya_id: null,
              branch_id: null,
              ...scope,
            }
        : role === "BRANCH_ADMIN"
          ? scope
        : role === "SUPER_ADMIN"
          ? {
              state_id: null,
              district_id: null,
              valaya_id: null,
              branch_id: null,
            }
          : {
              state_id: null,
              district_id: null,
              valaya_id: null,
              branch_id: null,
            };

    return supabaseClient
      .from("user_profiles")
      .update({
        status: "APPROVED",
        approved_at: new Date().toISOString(),
        approved_by: adminId ?? null,
        role,
        ...scopeUpdates,
      })
      .eq("id", id);
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

  updateRole: async (id: string, role: UserRole, scope: UserScopeUpdate = {}) => {
    const scopeUpdates =
      role === "VALAYA_ADMIN"
        ? {
            district_id: null,
            branch_id: null,
            ...scope,
          }
        : role === "DISTRICT_ADMIN"
          ? {
              valaya_id: null,
              branch_id: null,
              ...scope,
            }
        : role === "BRANCH_ADMIN"
          ? scope
        : role === "SUPER_ADMIN"
          ? {
              state_id: null,
              district_id: null,
              valaya_id: null,
              branch_id: null,
            }
          : scope;

    return supabaseClient
      .from("user_profiles")
      .update({
        role,
        ...scopeUpdates,
      })
      .eq("id", id);
  },

  makeUser: async (id: string) => {
    return supabaseClient
      .from("user_profiles")
      .update({
        role: "USER",
        state_id: null,
        district_id: null,
        valaya_id: null,
        branch_id: null,
      })
      .eq("id", id);
  },
};
