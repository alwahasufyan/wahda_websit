"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "Tajawal, sans-serif", margin: 0 }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "32rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem", color: "#1e293b" }}>
              حدث خطأ غير متوقع
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              نعتذر عن هذا الخطأ. يمكنك إعادة المحاولة أو مراجعة التفاصيل.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "0.625rem 1.5rem",
                  backgroundColor: "#0d9488",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => setShowDetails((v) => !v)}
                style={{
                  padding: "0.625rem 1.5rem",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.375rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                {showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              </button>
            </div>
            {showDetails && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.375rem",
                  textAlign: "left",
                  direction: "ltr",
                  fontSize: "0.75rem",
                  color: "#991b1b",
                  maxHeight: "200px",
                  overflow: "auto",
                  wordBreak: "break-word",
                }}
              >
                <strong>{error.message}</strong>
                {error.digest && <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>Digest: {error.digest}</div>}
                {error.stack && (
                  <pre style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap", fontSize: "0.7rem" }}>
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
