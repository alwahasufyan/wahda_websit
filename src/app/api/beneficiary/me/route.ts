import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getBeneficiarySessionFromRequest } from "@/lib/beneficiary-auth";

export async function GET(req: NextRequest) {
  const session = await getBeneficiarySessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const beneficiary = await prisma.beneficiary.findFirst({
    where: { id: session.id, deleted_at: null },
    select: {
      id: true,
      name: true,
      card_number: true,
      birth_date: true,
      total_balance: true,
      remaining_balance: true,
      status: true,
      notifications: {
        where: { is_read: false },
        select: { id: true },
      },
    },
  });

  if (!beneficiary) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  return NextResponse.json({
    ...beneficiary,
    total_balance: Number(beneficiary.total_balance),
    remaining_balance: Number(beneficiary.remaining_balance),
    unread_count: beneficiary.notifications.length,
    notifications: undefined,
  });
}
