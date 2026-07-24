import { UserProfile } from "../types/user"; // Import UserProfile type

export const useUserRole = () => {
  const getRoleAccess = (profile: UserProfile) => {
    const isApproved = profile.status === "APPROVED" && profile.is_active;
    const adminRoles: Array<UserProfile["role"]> = [
      "SUPER_ADMIN",
      "STATE_ADMIN",
      "DISTRICT_ADMIN",
      "VALAYA_ADMIN",
      "BRANCH_ADMIN",
      "PANCHANGA_ADMIN",
    ];

    return {
      isAdmin: adminRoles.includes(profile.role) && isApproved,
      isSuperAdmin: profile.role === "SUPER_ADMIN" && isApproved,
      isUserBlocked: profile.role === "USER" || !isApproved,
      // Add more specific checks as needed
    };
  };

  return { getRoleAccess };
};
