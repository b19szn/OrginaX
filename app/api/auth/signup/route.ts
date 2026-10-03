import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are all required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const assignedRole = role === "TEACHER" || role === "ADMIN" ? role : "STUDENT";

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        tierCode: "FREE",
        accountStatus: "ACTIVE",
      },
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

    const token = createSessionToken({ userId: newUser.id, email: newUser.email });

    const response = NextResponse.json({
      success: true,
      user: newUser,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
