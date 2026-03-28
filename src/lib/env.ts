/**
 * التحقق من متغيرات البيئة المطلوبة عند بدء التشغيل.
 * يُستدعى من layout.tsx لضمان فحص مبكر.
 */

const REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

const OPTIONAL_VARS = [
  "REDIS_URL",
  "BACKUP_ENCRYPTION_KEY",
  "BENEFICIARY_TOKEN_SECRET",
  "ADMIN_SEED_PASSWORD",
  "INITIAL_BALANCE",
] as const;

let _validated = false;

export function validateEnv() {
  if (_validated) return;
  _validated = true;

  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ متغيرات البيئة التالية مطلوبة ولم يتم تعيينها:\n${missing.map(k => `   - ${k}`).join("\n")}\n\nراجع ملف .env.example للتفاصيل.`
    );
  }

  // تحذيرات للمتغيرات الاختيارية المهمة
  if (!process.env.REDIS_URL?.trim()) {
    console.warn("⚠️  REDIS_URL غير معيّن — سيتم استخدام الذاكرة المحلية لـ Rate Limiting و SSE");
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn("⚠️  JWT_SECRET قصير جداً — يُنصح باستخدام 64 حرفاً على الأقل");
  }
}
