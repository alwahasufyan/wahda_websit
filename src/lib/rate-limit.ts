/**
 * In-memory rate limiter — مناسب للنشر الفردي (single instance).
 * يتتبع عدد المحاولات لكل مفتاح خلال نافذة زمنية محددة.
 */

interface Bucket {
  count: number;
  resetAt: number; // timestamp ms
}

// Map<key, Bucket> — لا تحتاج مكتبة خارجية
const store = new Map<string, Bucket>();
const MAX_STORE_SIZE = 10_000;

// ── حدود مختلفة حسب نوع العملية ──
interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login:   { windowMs: 15 * 60 * 1000, maxAttempts: 7 },    // 7 محاولات / 15 دقيقة
  search:  { windowMs: 60 * 1000,       maxAttempts: 60 },   // 60 طلب / دقيقة
  deduct:  { windowMs: 60 * 1000,       maxAttempts: 30 },   // 30 عملية / دقيقة
  api:     { windowMs: 60 * 1000,       maxAttempts: 100 },  // 100 طلب / دقيقة
};

const DEFAULT_CONFIG: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxAttempts: 10 };

/** يُرجع null إذا مسموح، أو رسالة خطأ إذا تجاوز الحد */
export function checkRateLimit(key: string, category: string = "login"): string | null {
  const config = RATE_LIMITS[category] ?? DEFAULT_CONFIG;
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // نافذة جديدة — التحقق من حد الذاكرة
    if (store.size >= MAX_STORE_SIZE) {
      const oldest = store.entries().next().value;
      if (oldest) store.delete(oldest[0]);
    }
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  if (bucket.count >= config.maxAttempts) {
    const remainingSec = Math.ceil((bucket.resetAt - now) / 1000);
    if (remainingSec > 60) {
      const remainingMinutes = Math.ceil(remainingSec / 60);
      return `تم تجاوز الحد المسموح به. يرجى المحاولة بعد ${remainingMinutes} دقيقة.`;
    }
    return `تم تجاوز الحد المسموح به. يرجى المحاولة بعد ${remainingSec} ثانية.`;
  }

  bucket.count += 1;
  return null;
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

// تنظيف تلقائي كل 5 دقائق لمنع تسرب الذاكرة
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (now >= bucket.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}
