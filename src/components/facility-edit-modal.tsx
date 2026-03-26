"use client";

import React, { useState } from "react";
import { Pencil, X, Loader2, RotateCcw } from "lucide-react";
import { Button, Input, Card } from "./ui";
import { updateFacility } from "@/app/actions/facility";

interface Props {
  facility: { id: string; name: string; username: string };
}

export function FacilityEditModal({ facility }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(facility.name);
  const [username, setUsername] = useState(facility.username);
  const [resetPassword, setResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await updateFacility({ id: facility.id, name, username, resetPassword });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setResetPassword(false);
        }, 800);
      }
    } catch {
      setError("خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(null); setSuccess(false); setName(facility.name); setUsername(facility.username); setResetPassword(false); }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
        title="تعديل المرفق"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <Card className="w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">تعديل المرفق</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">اسم المرفق</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="اسم المرفق الصحي"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">اسم المستخدم</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  dir="ltr"
                  placeholder="hospital_name"
                />
                <p className="mt-1 text-xs text-slate-400">أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط</p>
              </div>

              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                <input
                  id="reset-pw"
                  type="checkbox"
                  checked={resetPassword}
                  onChange={(e) => setResetPassword(e.target.checked)}
                  className="h-4 w-4 accent-amber-600"
                />
                <label htmlFor="reset-pw" className="flex items-center gap-1.5 text-sm font-bold text-amber-800 cursor-pointer">
                  <RotateCcw className="h-3.5 w-3.5" />
                  إعادة تعيين كلمة المرور إلى الافتراضية (123456)
                </label>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                  ✓ تم الحفظ بنجاح
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : null}
                  {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
