# دليل النشر - Wahda Healthcare System

## معلومات السيرفر

- **السيرفر**: dev-waadapp-ly
- **الدومين**: alwaha-care.ly
- **مسار المشروع**: `/opt/wahda_websit/alwaha-care`
- **الريبو**: `https://github.com/OmarAfoshAhmad/wahda_websit.git` (branch: `main`)

## Docker

### الحاويات

| الحاوية            | الدور                  | الشبكة                |
| ------------------ | ---------------------- | --------------------- |
| `wahda_app`        | Next.js (هذا التطبيق)  | `waadapp_tba_network` |
| `wahda_redis`      | Redis 7 (cache/pubsub) | `waadapp_tba_network` |
| `waadapp-db`       | PostgreSQL 16          | `waadapp_tba_network` |
| `waadapp-frontend` | تطبيق آخر (TBA)        | `waadapp_tba_network` |
| `waadapp-backend`  | تطبيق آخر (TBA)        | `waadapp_tba_network` |

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
JWT_SECRET=<SECRET_1>
BACKUP_ENCRYPTION_KEY=<SECRET_2>
BENEFICIARY_TOKEN_SECRET=<SECRET_3>
REDIS_PASSWORD=<STRONG_RANDOM_PASSWORD>
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<ADMIN_PASSWORD>
DEFAULT_ADMIN_NAME=System Admin
```

> **ملاحظة**: `REDIS_URL` يُبنى تلقائياً في `docker-compose.prod.yml` من `REDIS_PASSWORD`.
> **مهم**: `JWT_SECRET` و `BACKUP_ENCRYPTION_KEY` و `BENEFICIARY_TOKEN_SECRET` يجب أن تكون **مختلفة عن بعضها**.

## Redis — إعدادات مهمة

- **الحاوية**: `wahda_redis` (redis:7-alpine)
- **الشبكة**: `waadapp_tba_network`
- يستخدم كلمة مرور عبر `--requirepass` (من متغير `REDIS_PASSWORD`)
- حد الذاكرة: 128MB مع سياسة `allkeys-lru`
- بيانات محفوظة في volume `redis_data`
- Redis **اختياري** — التطبيق يعمل بدونه (fallback للذاكرة المحلية)
- عند توفره: يُمكّن مشاركة rate-limit وإشعارات SSE بين عدة instances

## Prisma — إعدادات مهمة

- **binaryTargets**: يجب أن يكون `["native", "debian-openssl-3.0.x"]` في `schema.prisma`
  - السيرفر يستخدم `debian-openssl-3.0.x` (bookworm)
  - بدون هذا الإعداد يظهر خطأ: `PrismaClientInitializationError: could not locate Query Engine`

## Dockerfile — إعدادات مهمة

- يجب تثبيت `openssl` في مرحلة runner: `apt-get install -y openssl`
- يجب `chown -R node:node /app` قبل `USER node` (Prisma يحتاج صلاحيات كتابة)

## خطوات رفع تحديث

> **⚠️ تحذير حاسم**: لا تمسح البيانات الفعلية الموجودة في قاعدة البيانات مهما كان السبب.
> لا تستخدم `prisma migrate reset` أو `prisma db push --force-reset` على الإنتاج أبداً.
> المايقريشن فقط عبر `prisma migrate deploy` الذي يطبّق المايقريشنات الجديدة دون مسح البيانات.

```bash
# 1. على جهازك المحلي
git add -A
git commit -m "وصف التحديث"
git push origin main

# 2. على السيرفر
cd /opt/wahda_websit/alwaha-care
git pull origin main

# 3. إعادة بناء الصورة (بدون مسح volumes أو بيانات)
docker compose -f docker-compose.prod.yml down
docker build -t wahda_web:latest . --no-cache
docker compose -f docker-compose.prod.yml up -d

# 4. تطبيق المايقريشنات الجديدة (إن وُجدت) — آمن على البيانات
docker exec wahda_app npx prisma migrate deploy

# 5. التحقق (انتظر 30 ثانية)
docker logs wahda_app --tail 20
```

### ⛔ أوامر محظورة على الإنتاج

| الأمر                          | السبب                                           |
| ------------------------------ | ----------------------------------------------- |
| `prisma migrate reset`         | يمسح جميع البيانات ويعيد إنشاء الجداول من الصفر |
| `prisma db push --force-reset` | يحذف الجداول ويعيد إنشاءها                      |
| `docker compose down -v`       | يحذف الـ volumes (بيانات القاعدة + Redis)       |
| `docker volume rm ...`         | حذف مباشر لبيانات محفوظة                        |

### ✅ أوامر آمنة على الإنتاج

| الأمر                             | الوظيفة                                |
| --------------------------------- | -------------------------------------- |
| `prisma migrate deploy`           | يطبّق المايقريشنات الجديدة فقط دون مسح |
| `docker compose down` (بدون `-v`) | يوقف الحاويات مع الحفاظ على البيانات   |
| `docker build --no-cache`         | يعيد بناء الصورة فقط                   |

## أخطاء شائعة وحلولها

| الخطأ                                                            | السبب                        | الحل                                            |
| ---------------------------------------------------------------- | ---------------------------- | ----------------------------------------------- |
| `P1001: Can't reach database`                                    | الحاوية ليست على نفس شبكة DB | أضف `waadapp_tba_network` (external) في compose |
| `PrismaClientInitializationError: could not locate Query Engine` | binaryTargets خاطئ           | أضف `debian-openssl-3.0.x` في schema.prisma     |
| `EACCES: permission denied`                                      | صلاحيات الملفات              | أضف `chown -R node:node /app` قبل `USER node`   |
| `Cannot find module openssl`                                     | openssl غير مثبت             | أضف `apt-get install -y openssl` في Dockerfile  |
| `DATABASE_URL not set`                                           | متغيرات بيئة ناقصة           | تحقق من `.env.production` على السيرفر           |
| `Failed to find Server Action`                                   | كاش متصفح قديم               | امسح كاش المتصفح أو Ctrl+F5                     |
| `[redis:pub] Error: connect ECONNREFUSED`                        | Redis غير متاح               | التطبيق يعمل بدونه — تأكد من `wahda_redis` يعمل |
