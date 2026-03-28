"use client";

import { useState } from "react";
import { KeyRound, Loader2, Check } from "lucide-react";

export function BeneficiaryResetPinButton({ beneficiaryId }: { beneficiaryId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onReset() {
    const yes = window.confirm("هل تريد إعادة تعيين PIN لهذا المستفيد؟\nسيُطلب منه اختيار PIN جديد عند الدخول القادم.");
    if (!yes) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/beneficiary/${beneficiaryId}/reset-pin`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        window.alert(data?.error ?? "فشل إعادة التعيين");
        return;
      }
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onReset}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
      title="إعادة تعيين PIN"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : done ? <Check className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
      {done ? "تم" : "Reset PIN"}
    </button>
  );
}
