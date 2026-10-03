import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo, demoEmail } = body;

    let user;

    if (isDemo && demoEmail) {
      const cleanEmail = demoEmail.trim().toLowerCase();
      const isAdmin = cleanEmail.includes("admin");
      const isEvaluator = cleanEmail.includes("evaluator");

      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        // Fallback create demo user if missing
        user = await prisma.user.create({
          data: {
            name: isAdmin
              ? "Shezan Mahmud"
              : isEvaluator
              ? "Dr. Eleanor Vance"
              : "Alex Rivera",
            email: cleanEmail,
            role: isAdmin ? "ADMIN" : isEvaluator ? "TEACHER" : "STUDENT",
            adminRole: isAdmin ? "SuperAdmin" : null,
            tierCode: isAdmin ? "ENTERPRISE" : isEvaluator ? "ACADEMIC" : "FREE",
            accountStatus: "ACTIVE",
          },
        });
      } else if (isAdmin && (user.role !== "ADMIN" || !user.adminRole)) {
        // Ensure admin user has ADMIN role and SuperAdmin level
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            adminRole: "SuperAdmin",
            tierCode: "ENTERPRISE",
            name: user.name || "Shezan Mahmud",
          },
        });
      }
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 }
        );
      }

      const cleanEmail = email.trim().toLowerCase();
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        if (cleanEmail === "admin@originax.online") {
          user = await prisma.user.create({
            data: {
              name: "Shezan Mahmud",
              email: cleanEmail,
              passwordHash: hashPassword(password),
              role: "ADMIN",
              adminRole: "SuperAdmin",
              tierCode: "ENTERPRISE",
              accountStatus: "ACTIVE",
            },
          });
        } else {
          return NextResponse.json(
            { error: "No account found matching this institutional email." },
            { status: 401 }
          );
        }
      } else {
        // If user had no passwordHash set yet (e.g. seeded demo user), set it now
        if (!user.passwordHash) {
          const newHash = hashPassword(password);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          });
        } else {
          const isValid = verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return NextResponse.json(
              { error: "Invalid password. Please check your credentials." },
              { status: 401 }
            );
          }
        }
      }
    }

    if (user.accountStatus === "SUSPENDED" || user.accountStatus === "FROZEN") {
      return NextResponse.json(
        { error: "This account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    const token = createSessionToken({ userId: user.id, email: user.email });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminRole: user.adminRole,
      tierCode: user.tierCode,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
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
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "Authentication process failed." },
      { status: 500 }
    );
  }
}
