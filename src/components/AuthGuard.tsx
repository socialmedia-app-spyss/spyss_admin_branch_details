import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Navigate, Outlet } from "react-router-dom";
import { UserProfile } from "../types/user"; // Import UserProfile type

interface AuthGuardProps {
  allowedRoles: Array<UserProfile["role"]>;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles }) => {
  const { data: identity, isLoading } = useGetIdentity<UserProfile>();

  console.log("AuthGuard - isLoading:", isLoading);
  console.log("AuthGuard - identity:", identity);
  console.log("AuthGuard - allowedRoles:", allowedRoles);

  if (isLoading) {
    return <div>Loading permissions...</div>; // Or a proper loading spinner
  }

  if (!identity) {
    console.log("AuthGuard - Not authenticated, redirecting to /login");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(identity.role)) {
    console.log(`AuthGuard - Role "${identity.role}" not in allowed roles [${allowedRoles.join(", ")}], redirecting to /access-denied`);
    return <Navigate to="/access-denied" />;
  }

  console.log("AuthGuard - User is authorized, rendering Outlet");
  return <Outlet />;
};