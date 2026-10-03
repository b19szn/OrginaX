import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET_KEY = process.env.AUTH_SECRET || "originax-plagiarism-detector-secure-token-2026";
export const COOKIE_NAME = "originax_session";

// Password Hashing using PBKDF2 with salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, hash] = storedHash.split(":");
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computedHash, "hex"));
  } catch {
    return false;
  }
}

// Session Token Creation & Verification using HMAC-SHA256
export function createSessionToken(payload: { userId: string; email: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }); // 30 days
  const base64Data = Buffer.from(data).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(base64Data).digest("base64url");
  return `${base64Data}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; email: string } | null {
  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(base64Data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Data, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// Get current user in API routes or Server Components
export async function getAuthenticatedUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRole: true,
        tierCode: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    if (!user || user.accountStatus === "SUSPENDED") return null;

    return user;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
