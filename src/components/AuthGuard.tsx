import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Navigate, Outlet } from "react-router-dom";
import { UserProfile } from "../types/user"; // Import UserProfile type

interface AuthGuardProps {
  allowedRoles: Array<UserProfile["role"]>;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles }) => {
  const { data: identity, isLoading } = useGetIdentity<UserProfile>();

  if (isLoading) {
    return <div>Loading permissions...</div>; // Or a proper loading spinner
  }

  if (!identity) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(identity.role)) {
    return <Navigate to="/access-denied" />;
  }

  return <Outlet />;
};