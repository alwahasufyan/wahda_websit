"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Wallet, LogOut, CheckCheck, Volume2, VolumeX } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  amount: number | null;
  is_read: boolean;
  created_at: string;
};

type Tx = {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  facility_name: string;
};

type DashboardData = {
  id: string;
  name: string;
  card_number: string;
  birth_date: string | null;
  total_balance: number;
  remaining_balance: number;
  status: string;
  transactions: Tx[];
  notifications: Notification[];
};

const TYPE_LABELS: Record<string, string> = {
  MEDICINE: "دواء",
  SUPPLIES: "مستلزمات",
  CANCELLATION: "إلغاء",
  IMPORT: "رصيد مستخدم",
};

export function BeneficiaryDashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const unreadCount = useMemo(() => data.notifications.filter((n) => !n.is_read).length, [data.notifications]);
  const usedBalance = data.total_balance - data.remaining_balance;

  function playNotificationTone() {
    try {
      const win = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextCtor = globalThis.AudioContext ?? win.webkitAudioContext;
      if (!AudioContextCtor) return;
      const audioContext = new AudioContextCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(988, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.07, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.22);
    } catch {
      // تجاهل الأجهزة التي لا تدعم الصوت البرمجي
    }
  }

  useEffect(() => {
    const es = new EventSource("/api/beneficiary/notifications/stream");
    es.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        id: string;
        title: string;
        message: string;
        amount?: number;
        remaining_balance?: number;
        created_at: string;
        transaction?: {
          id: string;
          amount: number;
          type: string;
          created_at: string;
          facility_name: string;
        };
      };

      setData((prev) => ({
        ...prev,
        remaining_balance: payload.remaining_balance ?? prev.remaining_balance,
        transactions: payload.transaction
          ? [payload.transaction, ...prev.transactions.filter((tx) => tx.id !== payload.transaction!.id)].slice(0, 30)
          : prev.transactions,
        notifications: [
          {
            id: payload.id,
            title: payload.title,
            message: payload.message,
            amount: payload.amount ?? null,
            is_read: false,
            created_at: payload.created_at,
          },
          ...prev.notifications,
        ].slice(0, 20),
      }));

      setToast(payload.message);
      window.setTimeout(() => setToast(null), 4500);

      if (soundEnabled) {
        playNotificationTone();
      }
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate([80, 40, 80]);
      }
    };

    return () => es.close();
  }, [soundEnabled]);

  async function markAllRead() {
    if (markingRead) return;
    setMarkingRead(true);
    try {
      await fetch("/api/beneficiary/notifications", { method: "PATCH" });
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
      }));
    } finally {
      setMarkingRead(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/beneficiary/logout", { method: "POST" });
    window.location.href = "/beneficiary/login";
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-8 pt-5">
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">بوابة المستفيد</p>
          <h1 className="text-lg font-black text-slate-900">مرحباً {data.name.split(" ")[0]}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${soundEnabled ? "border-primary/30 bg-primary-light text-primary" : "border-slate-200 bg-white text-slate-700"}`}
            aria-label={soundEnabled ? "إيقاف صوت الإشعارات" : "تشغيل صوت الإشعارات"}
            title={soundEnabled ? "الصوت مفعل" : "الصوت متوقف"}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              aria-label="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -left-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute left-0 z-30 mt-2 w-80 max-w-[85vw] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-800">الإشعارات</p>
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={markingRead || unreadCount === 0}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary disabled:opacity-50"
                  >
                    <CheckCheck className="h-4 w-4" />
                    تحديد الكل كمقروء
                  </button>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {data.notifications.length === 0 ? (
                    <p className="py-5 text-center text-xs text-slate-400">لا توجد إشعارات</p>
                  ) : (
                    data.notifications.map((n) => (
                      <div key={n.id} className={`rounded-xl border p-2.5 ${n.is_read ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50"}`}>
                        <p className="text-xs font-black text-slate-800">{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{n.message}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{new Date(n.created_at).toLocaleString("ar-LY")}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-linear-to-br from-[#1f4e8c] to-[#173b6a] p-5 text-white shadow-md">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <p className="text-xs font-bold uppercase tracking-wider text-blue-100">الرصيد الحالي</p>
        </div>
        <p className="text-4xl font-black leading-none">{data.remaining_balance.toLocaleString("ar-LY")}</p>
        <p className="mt-1 text-sm text-blue-100">دينار ليبي</p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-2 text-center">
          <div className="rounded-lg bg-white/10 py-2">
            <p className="text-[11px] font-bold text-blue-100">المستخدم</p>
            <p className="text-base font-black">{usedBalance.toLocaleString("ar-LY")}</p>
          </div>
          <div className="rounded-lg bg-white/10 py-2">
            <p className="text-[11px] font-bold text-blue-100">الكلي</p>
            <p className="text-base font-black">{data.total_balance.toLocaleString("ar-LY")}</p>
          </div>
        </div>
      </div>

      {/* User meta */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-bold text-slate-800">رقم البطاقة: <span className="font-mono">{data.card_number}</span></p>
        {data.birth_date && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-4 w-4" />
            تاريخ الميلاد: {new Date(data.birth_date).toLocaleDateString("ar-LY")}
          </p>
        )}
      </div>

      {/* Transactions */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-black text-slate-800">آخر الحركات</h2>
        </div>

        {data.transactions.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">لا توجد حركات حالياً</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{TYPE_LABELS[tx.type] ?? tx.type}</p>
                  <p className="text-xs text-slate-500">{tx.facility_name}</p>
                  <p className="text-[11px] text-slate-400">{new Date(tx.created_at).toLocaleDateString("ar-LY")}</p>
                </div>
                <span className="text-base font-black text-red-600">-{tx.amount.toLocaleString("ar-LY")} د.ل</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-x-4 bottom-4 z-40 rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-lg">
          <p className="text-sm font-black text-emerald-700">تم خصم جديد</p>
          <p className="text-xs text-emerald-700">{toast}</p>
        </div>
      )}
    </div>
  );
}
