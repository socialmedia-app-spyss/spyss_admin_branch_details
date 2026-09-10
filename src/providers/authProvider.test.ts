import assert from "node:assert/strict";
import test from "node:test";
import { checkUserAccess } from "./accessControl.ts";
import type { UserProfile } from "../types/user.ts";

const createMockIdentity = (role: string, status = "APPROVED", isActive = true): UserProfile => ({
  id: "test-user-id",
  email: "valaya@spyss.org",
  full_name: "Valaya Admin Test",
  role: role as any,
  status: status as any,
  is_active: isActive,
  state_id: "state-1",
  district_id: "dist-1",
  valaya_id: "valaya-1",
  branch_id: null,
  display_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  approved_by: "superadmin-id",
  approved_at: new Date().toISOString(),
  created_by: null,
  updated_by: null,
});

test("VALAYA_ADMIN can access app_branches (list, create, edit, show)", () => {
  const identity = createMockIdentity("VALAYA_ADMIN");

  assert.deepEqual(
    checkUserAccess({ identity, resource: "app_branches", action: "list" }),
    { can: true },
    "VALAYA_ADMIN should be able to list app_branches"
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "app_branches", action: "create" }),
    { can: true },
    "VALAYA_ADMIN should be able to create app_branches"
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "app_branches", action: "edit" }),
    { can: true },
    "VALAYA_ADMIN should be able to edit app_branches"
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "app_branches", action: "show" }),
    { can: true },
    "VALAYA_ADMIN should be able to show app_branches"
  );
});

test("VALAYA_ADMIN can access branches and alias routes", () => {
  const identity = createMockIdentity("VALAYA_ADMIN");

  assert.deepEqual(
    checkUserAccess({ identity, resource: "branches", action: "list" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "branches", action: "create" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "/branches/create", action: "create" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({
      identity,
      action: "list",
      params: { resource: { name: "app_branches" } },
    }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({
      identity,
      action: "create",
      params: { resource: { identifier: "app_branches" } },
    }),
    { can: true }
  );
});

test("VALAYA_ADMIN can access dashboard, users, and assigned master resources", () => {
  const identity = createMockIdentity("VALAYA_ADMIN");

  assert.deepEqual(
    checkUserAccess({ identity, resource: "dashboard", action: "list" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "users", action: "list" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "master_valayas", action: "list" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "master_districts", action: "list" }),
    { can: true }
  );
});

test("VALAYA_ADMIN cannot access super admin restricted resources", () => {
  const identity = createMockIdentity("VALAYA_ADMIN");

  const restricted = [
    "notifications",
    "app_notifications",
    "events",
    "app_events",
    "carousels",
    "app_carousel",
    "app_config",
    "api-stats",
    "settings",
    "master_states",
  ];

  for (const res of restricted) {
    assert.deepEqual(
      checkUserAccess({ identity, resource: res, action: "list" }),
      { can: false },
      `VALAYA_ADMIN should not access ${res}`
    );
  }
});

test("SUPER_ADMIN maintains unrestricted access", () => {
  const identity = createMockIdentity("SUPER_ADMIN");

  assert.deepEqual(
    checkUserAccess({ identity, resource: "app_branches", action: "create" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "notifications", action: "create" }),
    { can: true }
  );

  assert.deepEqual(
    checkUserAccess({ identity, resource: "app_config", action: "edit" }),
    { can: true }
  );

  // Unrestricted even if status or active flag was not explicitly set to APPROVED
  const legacySuperAdmin = createMockIdentity("SUPER_ADMIN", null as any, true);
  assert.deepEqual(
    checkUserAccess({ identity: legacySuperAdmin, resource: "app_branches", action: "list" }),
    { can: true }
  );
  assert.deepEqual(
    checkUserAccess({ identity: legacySuperAdmin, resource: "api-stats", action: "list" }),
    { can: true }
  );
});

test("Other roles (PANCHANGA_ADMIN, USER, unapproved) are strictly unaffected", () => {
  const panchangaAdmin = createMockIdentity("PANCHANGA_ADMIN");
  assert.deepEqual(
    checkUserAccess({ identity: panchangaAdmin, resource: "app_panchanga", action: "list" }),
    { can: true }
  );
  assert.deepEqual(
    checkUserAccess({ identity: panchangaAdmin, resource: "app_branches", action: "create" }),
    { can: false }
  );

  const regularUser = createMockIdentity("USER");
  assert.deepEqual(
    checkUserAccess({ identity: regularUser, resource: "app_branches", action: "list" }),
    { can: false }
  );

  const pendingAdmin = createMockIdentity("VALAYA_ADMIN", "PENDING");
  assert.deepEqual(
    checkUserAccess({ identity: pendingAdmin, resource: "app_branches", action: "list" }),
    { can: false }
  );

  const inactiveAdmin = createMockIdentity("VALAYA_ADMIN", "APPROVED", false);
  assert.deepEqual(
    checkUserAccess({ identity: inactiveAdmin, resource: "app_branches", action: "list" }),
    { can: false }
  );

  assert.deepEqual(
    checkUserAccess({ identity: null, resource: "app_branches", action: "list" }),
    { can: false }
  );
});
