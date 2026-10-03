import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = cookies();
    try {
      cookieStore.delete(COOKIE_NAME);
    } catch {}

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete(COOKIE_NAME);
    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to logout" }, { status: 500 });
  }
}
