import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  productCategoryValidator,
  type ProductCategory,
} from "./schema";

export type StoreProduct = {
  _id: string;
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  category: string;
  price: number;
  pages: number;
  language?: string;
  edition?: string;
  coverFrom: number;
  coverTo: number;
  featured?: boolean;
  active: boolean;
  salesCount?: number;
  createdAt: number;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("products")
      .withIndex("active", (q) => q.eq("active", true))
      .collect();
    return rows.sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    author: v.string(),
    description: v.string(),
    category: productCategoryValidator,
    price: v.number(),
    pages: v.number(),
    language: v.optional(v.string()),
    edition: v.optional(v.string()),
    coverFrom: v.number(),
    coverTo: v.number(),
    featured: v.optional(v.boolean()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("products", {
      ...args,
      salesCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    patch: v.object({
      title: v.optional(v.string()),
      subtitle: v.optional(v.string()),
      author: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(productCategoryValidator),
      price: v.optional(v.number()),
      pages: v.optional(v.number()),
      language: v.optional(v.string()),
      edition: v.optional(v.string()),
      coverFrom: v.optional(v.number()),
      coverTo: v.optional(v.number()),
      featured: v.optional(v.boolean()),
      active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await requireAdmin(ctx);
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch(id, clean);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    // Keep purchase history intact; just remove the catalog row.
    await ctx.db.delete(id);
  },
});

export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return { seeded: 0 };

    const now = Date.now();
    const products: Array<
      Omit<StoreProduct, "_id"> & { category: ProductCategory }
    > = [
      {
        title: "مهندسی نرم‌افزار مدرن",
        subtitle: "از ایده تا محصول مقیاس‌پذیر",
        author: "دکتر آرش مرادی",
        description:
          "راهنمای جامع معماری نرم‌افزار، الگوهای طراحی و DevOps برای تیم‌های امروزی. با مثال‌های واقعی از استارتاپ‌های ایرانی و بین‌المللی، چک‌لیست‌های عملی و نکات مهاجرت به معماری میکروسرویس.",
        category: "برنامه‌نویسی",
        price: 248000,
        pages: 342,
        language: "فارسی",
        edition: "ویراست سوم",
        coverFrom: 245,
        coverTo: 280,
        featured: true,
        active: true,
        salesCount: 1284,
        createdAt: now - 86400000 * 30,
      },
      {
        title: "تایپوگرافی فارسی در وب",
        subtitle: "زیبایی‌شناسی حروف برای طراحان",
        author: "سارا خسروی",
        description:
          "همه‌چیز درباره انتخاب فونت فارسی، تنظیم میزان سطر، کشیدگی حروف و خوانایی در رابط‌های راست‌به‌چپ. همراه با مطالعه موردی فونت وزیرمتن و راهنمای کامل Web Font Optimization.",
        category: "طراحی و گرافیک",
        price: 168000,
        pages: 214,
        language: "فارسی",
        edition: "ویراست اول",
        coverFrom: 160,
        coverTo: 190,
        featured: true,
        active: true,
        salesCount: 976,
        createdAt: now - 86400000 * 24,
      },
      {
        title: "استارتاپ یک‌نفره",
        subtitle: "کسب‌وکار بدون تیم، بدون اتلاف",
        author: "امیر حسینی",
        description:
          "چطور به‌عنوان یک نفر محصول بسازیم، بازاریابی کنیم و رشد کنیم؟ شامل فریم‌ورک‌های اعتبارسنجی ایده، قالب‌های ایمیلی و جداول مالی آماده برای محاسبه نقطه سر‌به‌سر.",
        category: "کسب‌وکار",
        price: 195000,
        pages: 268,
        language: "فارسی",
        coverFrom: 130,
        coverTo: 160,
        featured: true,
        active: true,
        salesCount: 1532,
        createdAt: now - 86400000 * 18,
      },
      {
        title: "روان‌شناسی تمرکز",
        subtitle: "عمیق کار کن، کمتر اما بهتر",
        author: "نگار رستمی",
        description:
          "بر اساس پژوهش‌های نوین شناختی، تکنیک‌های کاربردی برای بازیابی تمرکز عمیق در دنیای پر‌از حواس‌پرتی. تمرین‌های ۲۱‌روزه و برنامه هفتگی پیشنهادی برای شروع.",
        category: "سبک زندگی",
        price: 132000,
        pages: 196,
        language: "فارسی",
        coverFrom: 190,
        coverTo: 220,
        featured: false,
        active: true,
        salesCount: 743,
        createdAt: now - 86400000 * 12,
      },
      {
        title: "ریاضیات گسسته برای علوم کامپیوتر",
        subtitle: "همراه با حل تمرین‌های کنکور ارشد",
        author: "دکتر محمود کریمی",
        description:
          "منبع مکمل دانشگاهی با بیش از ۴۰۰ تمرین حل‌شده، خلاصه فرمول‌ها و نکات تستی. مناسب دانشجویان مهندسی کامپیوتر و داوطلبان کنکور کارشناسی ارشد.",
        category: "مکمل دانشگاهی",
        price: 220000,
        pages: 415,
        language: "فارسی",
        edition: "ویراست پنجم",
        coverFrom: 210,
        coverTo: 240,
        featured: false,
        active: true,
        salesCount: 651,
        createdAt: now - 86400000 * 9,
      },
      {
        title: "تاریخ اندیشه سیاسی در ایران",
        subtitle: "از مشروطه تا معاصر",
        author: "دکتر فرهاد نیک‌پور",
        description:
          "روایتی مستند از تحول فکر سیاسی در ایران معاصر با تحلیل متن‌های اصلی و آرای اندیشمندان. شامل کتاب‌شناسی انتقادی و گاه‌شمار وقایع کلیدی.",
        category: "علوم انسانی",
        price: 186000,
        pages: 320,
        language: "فارسی",
        coverFrom: 20,
        coverTo: 45,
        featured: false,
        active: true,
        salesCount: 389,
        createdAt: now - 86400000 * 6,
      },
      {
        title: "طراحی رابط کاربری با فیگما",
        subtitle: "از وایرفریم تا دیزاین‌سیستم",
        author: "ملیکا صادقی",
        description:
          "آموزش گام‌به‌گام فیگما برای طراحی رابط فارسی: کامپوننت‌ها، اتولی‌آوت، پروتوتایپ و ساخت دیزاین‌سیستم قابل استفاده مجدد. همراه با فایل‌های تمرین قابل دانلود.",
        category: "طراحی و گرافیک",
        price: 154000,
        pages: 240,
        language: "فارسی",
        coverFrom: 280,
        coverTo: 310,
        featured: false,
        active: true,
        salesCount: 1120,
        createdAt: now - 86400000 * 4,
      },
      {
        title: "برنامه‌نویسی پایتون پیشرفته",
        subtitle: "الگوها، تست و کارایی",
        author: "کیوان ابراهیمی",
        description:
          "برای برنامه‌نویسانی که پایتون را می‌شناسند و می‌خواهند حرفه‌ای کد بزنند: تایپ‌هینت، async، الگوهای طراحی، تست‌نویسی و پروفایلینگ کارایی با مثال‌های عملی.",
        category: "برنامه‌نویسی",
        price: 265000,
        pages: 388,
        language: "فارسی",
        edition: "ویراست دوم",
        coverFrom: 100,
        coverTo: 140,
        featured: false,
        active: true,
        salesCount: 867,
        createdAt: now - 86400000 * 2,
      },
    ];

    for (const p of products) {
      await ctx.db.insert("products", p);
    }
    return { seeded: products.length };
  },
});

export async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("برای این عملیات باید وارد شوید.");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") {
    throw new Error("فقط مدیر فروشگاه به این بخش دسترسی دارد.");
  }
}
