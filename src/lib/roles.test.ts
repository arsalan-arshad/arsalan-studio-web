import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessClientChat,
  canDeactivateTarget,
  canDeleteUsers,
  canInviteRole,
  canListUsers,
  canManageInquiries,
  canToggleUserActive,
  inviteableRoles,
  isAdmin,
  isStaff,
  isSubAdmin,
  roleLabel,
} from "./roles";

describe("SUB_ADMIN smoke — role matrix", () => {
  it("identifies support vs admin vs client", () => {
    assert.equal(isSubAdmin("SUB_ADMIN"), true);
    assert.equal(isAdmin("SUB_ADMIN"), false);
    assert.equal(isStaff("SUB_ADMIN"), true);
    assert.equal(isStaff("ADMIN"), true);
    assert.equal(isStaff("CLIENT"), false);
  });

  it("never grants client chat to SUB_ADMIN", () => {
    assert.equal(canAccessClientChat("SUB_ADMIN"), false);
    assert.equal(canAccessClientChat("ADMIN"), true);
    assert.equal(canAccessClientChat("CLIENT"), true);
  });

  it("can manage inquiries and list users", () => {
    assert.equal(canManageInquiries("SUB_ADMIN"), true);
    assert.equal(canListUsers("SUB_ADMIN"), true);
  });

  it("cannot delete users or toggle active (ADMIN only)", () => {
    assert.equal(canDeleteUsers("SUB_ADMIN"), false);
    assert.equal(canToggleUserActive("SUB_ADMIN"), false);
    assert.equal(canDeleteUsers("ADMIN"), true);
    assert.equal(canToggleUserActive("ADMIN"), true);
  });

  it("may invite CLIENT and SUB_ADMIN only", () => {
    assert.deepEqual(inviteableRoles("SUB_ADMIN"), ["CLIENT", "SUB_ADMIN"]);
    assert.equal(canInviteRole("SUB_ADMIN", "CLIENT"), true);
    assert.equal(canInviteRole("SUB_ADMIN", "SUB_ADMIN"), true);
    assert.equal(canInviteRole("SUB_ADMIN", "ADMIN"), false);
  });

  it("ADMIN may invite any role and deactivate support/clients only", () => {
    assert.deepEqual(inviteableRoles("ADMIN"), [
      "CLIENT",
      "SUB_ADMIN",
      "ADMIN",
    ]);
    assert.equal(canDeactivateTarget("SUB_ADMIN"), true);
    assert.equal(canDeactivateTarget("CLIENT"), true);
    assert.equal(canDeactivateTarget("ADMIN"), false);
  });

  it("labels Support for UI", () => {
    assert.equal(roleLabel("SUB_ADMIN"), "Support");
  });
});
