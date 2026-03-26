import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/client-error
 * يستقبل أخطاء العميل (client-side exceptions) ويسجلها في AuditLog.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rateLimitError = checkRateLimit(`client-error:${ip}`, "api");
  if (rateLimitError) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  // التحقق من حجم الطلب
  const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > 50_000) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;

    const message = typeof body.message === "string" ? body.message.slice(0, 2000) : "Unknown error";
    const stack = typeof body.stack === "string" ? body.stack.slice(0, 5000) : undefined;
    const url = typeof body.url === "string" ? body.url.slice(0, 500) : undefined;
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? undefined;
    const digest = typeof body.digest === "string" ? body.digest.slice(0, 100) : undefined;

    logger.error("CLIENT_ERROR", { message, url, userAgent, digest });

    await prisma.auditLog.create({
      data: {
        user: "CLIENT",
        action: "CLIENT_ERROR",
        metadata: {
          message,
          stack,
          url,
          userAgent,
          digest,
          ip,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error("Failed to log client error", { error: String(e) });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
