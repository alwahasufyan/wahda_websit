import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بوابة المستفيد — الواحة للرعاية الصحية",
};

export default function BeneficiaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#f0f4fb] to-slate-50" dir="rtl">
      {children}
    </div>
  );
}
