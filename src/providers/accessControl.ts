import type { UserProfile } from "../types/user.ts";

export type AdminRole =
  | "SUPER_ADMIN"
  | "STATE_ADMIN"
  | "DISTRICT_ADMIN"
  | "VALAYA_ADMIN"
  | "BRANCH_ADMIN"
  | "PANCHANGA_ADMIN";

export type AppRole = AdminRole | "USER";

export const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "STATE_ADMIN",
  "DISTRICT_ADMIN",
  "VALAYA_ADMIN",
  "BRANCH_ADMIN",
  "PANCHANGA_ADMIN",
];

export const VALAYA_ADMIN_RESOURCES = [
  "dashboard",
  "branches",
  "app_branches",
  "latest_branches",
  "activities",
  "enquiries",
  "users",
  "master_districts",
  "master_valayas",
];

export const SUPER_ADMIN_ONLY_RESOURCES = [
  "settings",
  "master_states",
  "notifications",
  "app_notifications",
  "events",
  "app_events",
  "api-stats",
  "app_carousel",
  "app_config",
];

export const PANCHANGA_RESOURCES = [
  "daily_panchanga",
  "app_panchanga",
  "daily_amrutha_vachana",
  "app_amrutha_vachana",
  "amrutha_vachana_authors",
  "amrutha_vachana_author_translations",
];

export const checkUserAccess = ({
  identity,
  resource,
  action: _action,
  params,
}: {
  identity: UserProfile | null;
  resource?: string;
  action: string;
  params?: unknown;
}): { can: boolean } => {
  if (!identity) {
    return { can: false };
  }

  const userRole = (identity.role || "").trim().toUpperCase() as AppRole;

  if (userRole === "SUPER_ADMIN") {
    return { can: true };
  }

  if (identity.status !== "APPROVED" || !identity.is_active) {
    return { can: false };
  }

  if (userRole === "USER") {
    return { can: false };
  }

  const rawResource =
    (typeof resource === "string" ? resource : undefined) ||
    (params as any)?.resource?.name ||
    (params as any)?.resource?.identifier ||
    (typeof (params as any)?.resource === "string" ? (params as any)?.resource : undefined);

  const normalizedResource =
    typeof rawResource === "string"
      ? rawResource.replace(/^\//, "").split("/")[0]
      : undefined;

  if (userRole === "PANCHANGA_ADMIN") {
    return {
      can:
        normalizedResource === "dashboard" ||
        (normalizedResource !== undefined &&
          PANCHANGA_RESOURCES.includes(normalizedResource) &&
          _action !== "delete"),
    };
  }

  if (!normalizedResource || SUPER_ADMIN_ONLY_RESOURCES.includes(normalizedResource)) {
    return { can: false };
  }

  if (userRole === "VALAYA_ADMIN") {
    return {
      can:
        VALAYA_ADMIN_RESOURCES.includes(normalizedResource) ||
        normalizedResource === "branches" ||
        normalizedResource === "app_branches",
    };
  }

  if (userRole === "STATE_ADMIN") {
    return { can: true };
  }

  if (userRole === "DISTRICT_ADMIN") {
    return { can: true };
  }

  if (userRole === "BRANCH_ADMIN") {
    const allowedBranchResources = [
      "dashboard",
      "branches",
      "latest_branches",
      "activities",
      "enquiries",
    ];

    return { can: allowedBranchResources.includes(normalizedResource) };
  }

  return { can: false };
};
