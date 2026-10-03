import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get session" }, { status: 500 });
  }
}
