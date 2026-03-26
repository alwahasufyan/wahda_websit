# دليل النشر - Wahda Healthcare System

## معلومات السيرفر

- **السيرفر**: dev-waadapp-ly
- **الدومين**: alwaha-care.ly
- **مسار المشروع**: `/opt/wahda_websit/alwaha-care`
- **الريبو**: `https://github.com/OmarAfoshAhmad/wahda_websit.git` (branch: `main`)

## Docker

### الحاويات

| الحاوية            | الدور                 | الشبكة                |
| ------------------ | --------------------- | --------------------- |
| `wahda_app`        | Next.js (هذا التطبيق) | `waadapp_tba_network` |
| `waadapp-db`       | PostgreSQL 16         | `waadapp_tba_network` |
| `waadapp-frontend` | تطبيق آخر (TBA)       | `waadapp_tba_network` |
| `waadapp-backend`  | تطبيق آخر (TBA)       | `waadapp_tba_network` |

### الشبكات

- `waadapp_tba_network` — الشبكة المشتركة (external) التي يجب أن يكون `wahda_app` عليها
- `alwaha-care_default` — شبكة افتراضية لـ compose (لا تُستخدم)

### ملف docker-compose.prod.yml

- يجب أن يحتوي على `networks: waadapp_tba_network` مع `external: true`
- البورت: `3101:3000`

## قاعدة البيانات

- **الحاوية**: `waadapp-db`
- **اسم القاعدة**: `wahda_websit`
- **المستخدم**: `wahda_user`
- **كلمة المرور**: محفوظة في `.env.production` على السيرفر فقط
- **ملاحظة**: يوجد قاعدة أخرى `tba_waad_system` — ليست لنا!

## ملف .env.production (على السيرفر فقط)

```
APP_HOST_PORT=3101
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://wahda_user:<PASSWORD>@waadapp-db:5432/wahda_websit?schema=public
JWT_SECRET=<SECRET>
ADMIN_SEED_PASSWORD=admin123
```

## Prisma — إعدادات مهمة

- **binaryTargets**: يجب أن يكون `["native", "debian-openssl-3.0.x"]` في `schema.prisma`
  - السيرفر يستخدم `debian-openssl-3.0.x` (bookworm)
  - بدون هذا الإعداد يظهر خطأ: `PrismaClientInitializationError: could not locate Query Engine`

## Dockerfile — إعدادات مهمة

- يجب تثبيت `openssl` في مرحلة runner: `apt-get install -y openssl`
- يجب `chown -R node:node /app` قبل `USER node` (Prisma يحتاج صلاحيات كتابة)

## خطوات رفع تحديث

```bash
# 1. على جهازك المحلي
git add -A
git commit -m "وصف التحديث"
git push origin main

# 2. على السيرفر
cd /opt/wahda_websit/alwaha-care
git pull origin main
docker compose -f docker-compose.prod.yml down
docker build -t wahda_web:latest . --no-cache
docker compose -f docker-compose.prod.yml up -d

# 3. التحقق (انتظر 30 ثانية)
docker logs wahda_app --tail 20
```

## أخطاء شائعة وحلولها

| الخطأ                                                            | السبب                        | الحل                                            |
| ---------------------------------------------------------------- | ---------------------------- | ----------------------------------------------- |
| `P1001: Can't reach database`                                    | الحاوية ليست على نفس شبكة DB | أضف `waadapp_tba_network` (external) في compose |
| `PrismaClientInitializationError: could not locate Query Engine` | binaryTargets خاطئ           | أضف `debian-openssl-3.0.x` في schema.prisma     |
| `EACCES: permission denied`                                      | صلاحيات الملفات              | أضف `chown -R node:node /app` قبل `USER node`   |
| `Cannot find module openssl`                                     | openssl غير مثبت             | أضف `apt-get install -y openssl` في Dockerfile  |
| `DATABASE_URL not set`                                           | متغيرات بيئة ناقصة           | تحقق من `.env.production` على السيرفر           |
| `Failed to find Server Action`                                   | كاش متصفح قديم               | امسح كاش المتصفح أو Ctrl+F5                     |
