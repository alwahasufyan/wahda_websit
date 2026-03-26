import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getImportJobSkippedRowsWorkbook } from "@/lib/import-jobs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const report = await getImportJobSkippedRowsWorkbook(
    jobId,
    session.is_admin ? undefined : session.username
  );

  if (!report) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (report.empty) {
    return NextResponse.json({ error: "لا توجد حالات غير مستوردة لهذه المهمة." }, { status: 404 });
  }

  return new NextResponse(report.buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${report.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
