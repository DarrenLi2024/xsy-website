import { describe, it, expect } from "vitest";

describe("Session token utilities", () => {
  it("SESSION_COOKIE_NAME is defined", async () => {
    const { SESSION_COOKIE_NAME } = await import("@/lib/auth/session");
    expect(SESSION_COOKIE_NAME).toBe("xinshiye_session");
  });

  it("verifySessionToken rejects invalid token", async () => {
    const { verifySessionToken } = await import("@/lib/auth/session");
    const session = await verifySessionToken("invalid-token");
    expect(session).toBeNull();
  });

  it("verifySessionToken rejects empty token", async () => {
    const { verifySessionToken } = await import("@/lib/auth/session");
    const session = await verifySessionToken("");
    expect(session).toBeNull();
  });
});
