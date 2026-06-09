import { UserProfile } from "../types/user"; // Import UserProfile type

export const useUserRole = () => {
  const getRoleAccess = (profile: UserProfile) => {
    const isActive = profile.status === "ACTIVE";

    return {
      isAdmin: (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") && isActive,
      isSuperAdmin: profile.role === "SUPER_ADMIN" && isActive,
      isUserBlocked: profile.role === "USER" || !isActive,
      // Add more specific checks as needed
    };
  };

  return { getRoleAccess };
};
