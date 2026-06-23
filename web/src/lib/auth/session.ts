import { SignJWT, jwtVerify } from "jose";
import type { UserRole, AdminRole } from "@prisma/client";
import { randomBytes } from "crypto";

const COOKIE = process.env.NODE_ENV === "production" ? "__Host-xinshiye_session" : "xinshiye_session";
const DAY = 60 * 60 * 24;
let devSecretCache: Uint8Array | null = null;
let warnedEphemeralSecret = false;

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set in production and at least 32 characters");
    }
    if (!devSecretCache) {
      devSecretCache = randomBytes(32);
    }
    if (!warnedEphemeralSecret) {
      warnedEphemeralSecret = true;
      console.warn(
        "[auth] SESSION_SECRET 未设置或长度不足 32 字符，当前使用进程内临时密钥（重启后会话失效）。",
      );
    }
    return devSecretCache;
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  sub: string;
  role: UserRole;
  email: string;
  adminRole?: AdminRole | null;
};

export async function signSessionToken(payload: SessionPayload, maxAgeSec = DAY * 7) {
  return new SignJWT({
    role: payload.role,
    email: payload.email,
    adminRole: payload.adminRole,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const role = payload.role as UserRole | undefined;
    const email = payload.email as string | undefined;
    const adminRole = payload.adminRole as AdminRole | undefined;
    if (!sub || !role || !email) return null;
    return { sub, role, email, adminRole };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE;
