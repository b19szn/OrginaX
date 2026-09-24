import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRole: true,
        tierCode: true,
        accountStatus: true,
        createdAt: true,
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        adminRole: u.adminRole || "User",
        tierCode: u.tierCode,
        accountStatus: u.accountStatus,
        submissionsCount: u._count.submissions,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to load user registry" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    if (action === "SET_STATUS") {
      const { status } = body; // ACTIVE | FROZEN | SUSPENDED
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: status },
      });
      return NextResponse.json({ success: true, message: `User status changed to ${status}`, user: updated });
    }

    if (action === "SET_TIER") {
      const { tierCode } = body; // FREE | PRO | ENTERPRISE
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { tierCode },
      });
      return NextResponse.json({ success: true, message: `Plan tier updated to ${tierCode}`, user: updated });
    }

    if (action === "SET_ADMIN_ROLE") {
      const { adminRole } = body; // SuperAdmin | BillingAdmin | SupportAdmin | null
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { adminRole },
      });
      return NextResponse.json({ success: true, message: `Admin RBAC updated to ${adminRole || "None"}`, user: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid user action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "User action failed" }, { status: 500 });
  }
}
