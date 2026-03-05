import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/src/shared/lib/auth";

export type ApiSession = {
  userId: string;
  email: string;
  role: UserRole;
};

function readCookie(rawCookieHeader: string | null, key: string) {
  if (!rawCookieHeader) {
    return null;
  }

  const chunks = rawCookieHeader.split(";");
  for (const chunk of chunks) {
    const [cookieKey, ...rest] = chunk.trim().split("=");
    if (cookieKey === key) {
      return rest.join("=") || null;
    }
  }
  return null;
}

export function getApiSession(request: Request): ApiSession | null {
  const cookieHeader = request.headers.get("cookie");
  const token = readCookie(cookieHeader, AUTH_COOKIE_NAME);
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
