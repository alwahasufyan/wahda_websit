import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { beneficiaryLogin } from "@/lib/beneficiary-auth";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;
const GENERIC_AUTH_ERROR = "بيانات الدخول غير صحيحة";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const card_number = typeof body?.card_number === "string" ? body.card_number.trim().toUpperCase() : "";
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitError = await checkRateLimit(`beneficiary-login:${ip}`, "login");
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError }, { status: 429 });
  }

  if (!card_number) {
    return NextResponse.json({ error: "رقم البطاقة مطلوب" }, { status: 400 });
  }

  const beneficiary = await prisma.beneficiary.findFirst({
    where: { card_number: { equals: card_number, mode: "insensitive" }, deleted_at: null },
    select: {
      id: true,
      name: true,
      card_number: true,
      pin_hash: true,
      failed_attempts: true,
      locked_until: true,
    },
  });

  if (!beneficiary) {
    return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
  }

  // فحص الحجب
  const lockedUntil = beneficiary.locked_until as Date | null;
  if (lockedUntil && lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `الحساب محجوب مؤقتاً. حاول بعد ${minutesLeft} دقيقة` },
      { status: 429 }
    );
  }

  // لا يوجد PIN بعد → اطلب الإعداد
  if (!beneficiary.pin_hash) {
    return NextResponse.json({ status: "needs_setup" });
  }

  // يجب تقديم PIN إذا كان موجوداً
  if (!pin || pin.length !== 6) {
    return NextResponse.json({ status: "needs_pin" });
  }

  const valid = await bcrypt.compare(pin, beneficiary.pin_hash);

  if (!valid) {
    const newAttempts = beneficiary.failed_attempts + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;
    await prisma.beneficiary.update({
      where: { id: beneficiary.id },
      data: {
        failed_attempts: newAttempts,
        locked_until: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : undefined,
      },
    });
    const remaining = MAX_ATTEMPTS - newAttempts;
    return NextResponse.json(
      { error: shouldLock ? `تم حجب الحساب لمدة ${LOCK_MINUTES} دقائق` : `${GENERIC_AUTH_ERROR}. تبقى ${remaining} محاولة` },
      { status: 401 }
    );
  }

  // ناجح — إعادة تعيين المحاولات
  await prisma.beneficiary.update({
    where: { id: beneficiary.id },
    data: { failed_attempts: 0, locked_until: null },
  });

  await beneficiaryLogin({ id: beneficiary.id, name: beneficiary.name, card_number: beneficiary.card_number });
  return NextResponse.json({ status: "ok" });
}
