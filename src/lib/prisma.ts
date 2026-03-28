import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasourceUrl: appendPoolParams(process.env.DATABASE_URL ?? ""),
  });

  // إضافة مراقبة الأداء (Performance Monitoring) على استعلامات قاعدة البيانات
  // سيتم تسجيل أي استعلام يستغرق أكثر من 150 ملي ثانية
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now();
          const result = await query(args);
          const time = performance.now() - start;
          
          if (time > 150) {
            console.warn(`[PERFORMANCE WARNING] Query ${model}.${operation} took ${time.toFixed(2)}ms`);
          }
          
          return result;
        },
      },
    },
  });
};

/** يضيف connection_limit و pool_timeout إذا لم تكن موجودة في DATABASE_URL */
function appendPoolParams(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "10");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "20");
    return u.toString();
  } catch {
    return url;
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
