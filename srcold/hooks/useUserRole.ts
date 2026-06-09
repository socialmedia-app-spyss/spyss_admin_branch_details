import { useEffect, useState } from "react";
import { supabaseClient } from "../providers/supabase-client";
import { ROLES } from "../types/roles";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null); // Add status state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoleAndStatus() {
      const { data: authData } =
        await supabaseClient.auth.getUser();

      if (!authData.user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabaseClient
        .from("user_profiles")
        .select("role, status") // Select status as well
        .eq("id", authData.user.id)
        .single();

      setRole(profile?.role ?? null);
      setStatus(profile?.status ?? null); // Set status
      setLoading(false);
    }

    loadRoleAndStatus();
  }, []);

  const isActive = status === "ACTIVE"; // Define isActive based on status

  return {
    role,
    status, // Return status
    loading,
    isAdmin:
      isActive && (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN), // Check isActive
    isSuperAdmin:
      isActive && role === ROLES.SUPER_ADMIN, // Check isActive
  };
}