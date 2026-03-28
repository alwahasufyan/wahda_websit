import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { beneficiaryLogin } from "@/lib/beneficiary-auth";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

const GENERIC_AUTH_ERROR = "بيانات الدخول غير صحيحة";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const card_number = typeof body?.card_number === "string" ? body.card_number.trim().toUpperCase() : "";
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  const confirm_pin = typeof body?.confirm_pin === "string" ? body.confirm_pin.trim() : "";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitError = await checkRateLimit(`beneficiary-setup-pin:${ip}`, "login");
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError }, { status: 429 });
  }

  if (!card_number || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  if (pin !== confirm_pin) {
    return NextResponse.json({ error: "رمز PIN غير متطابق" }, { status: 400 });
  }

  const beneficiary = await prisma.beneficiary.findFirst({
    where: { card_number: { equals: card_number, mode: "insensitive" }, deleted_at: null },
    select: { id: true, name: true, card_number: true, pin_hash: true },
  });

  if (!beneficiary) {
    return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
  }

  // منع التعيين مرة ثانية (يجب المرور بالمشرف لإعادة التعيين)
  if (beneficiary.pin_hash) {
    return NextResponse.json({ error: "تم تعيين رمز PIN مسبقاً" }, { status: 409 });
  }

  const pin_hash = await bcrypt.hash(pin, 12);
  await prisma.beneficiary.update({
    where: { id: beneficiary.id },
    data: { pin_hash, failed_attempts: 0, locked_until: null },
  });

  await beneficiaryLogin({ id: beneficiary.id, name: beneficiary.name, card_number: beneficiary.card_number });
  return NextResponse.json({ status: "ok" });
}
