import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./products";

function generateTrackingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `PDF-${code.slice(0, 5)}-${code.slice(5)}`;
}

/** Start a checkout session from a list of product ids (the cart). */
export const createPendingOrder = mutation({
  args: { productIds: v.array(v.id("products")) },
  handler: async (ctx, { productIds }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("برای ثبت سفارش باید وارد شوید.");
    if (productIds.length === 0) throw new Error("سبد خرید خالی است.");

    // De-duplicate while preserving order
    const seen = new Set<string>();
    const ids = productIds.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const products = [];
    let total = 0;
    for (const id of ids) {
      const p = await ctx.db.get(id);
      if (!p || !p.active) throw new Error("یکی از کتاب‌ها دیگر در دسترس نیست.");
      products.push(p);
      total += p.price;
    }

    // Free up: remove any stale pending orders for this user (single active checkout)
    const stale = await ctx.db
      .query("orders")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    for (const o of stale) {
      if (o.status === "pending") {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("orderId", (q) => q.eq("orderId", o._id))
          .collect();
        for (const it of items) await ctx.db.delete(it._id);
        await ctx.db.delete(o._id);
      }
    }

    const orderId = await ctx.db.insert("orders", {
      userId: userId as any,
      totalAmount: total,
      status: "pending" as const,
      createdAt: Date.now(),
    });

    for (const p of products) {
      await ctx.db.insert("orderItems", {
        orderId: orderId as any,
        productId: p._id as any,
        titleSnapshot: p.title,
        priceSnapshot: p.price,
      });
    }

    return { orderId, total };
  },
});

/**
 * Simulated payment gateway. The frontend collects card number, CVV2,
 * expiry and dynamic password; here we validate the shape and mark the
 * order paid, granting entitlements and bumping sales counters.
 */
export const payOrder = mutation({
  args: {
    orderId: v.id("orders"),
    cardNumber: v.string(),
    cvv2: v.string(),
    month: v.number(),
    year: v.number(),
    dynamicPassword: v.string(),
  },
  handler: async (ctx, { orderId, cardNumber, cvv2, month, year, dynamicPassword }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("برای پرداخت باید وارد شوید.");

    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("سفارش یافت نشد.");
    if (order.userId !== userId) throw new Error("این سفارش متعلق به شما نیست.");
    if (order.status === "paid") throw new Error("این سفارش قبلاً پرداخت شده است.");
    if (order.status !== "pending") throw new Error("این سفارش قابل پرداخت نیست.");

    const cardDigits = cardNumber.replace(/\D/g, "");
    const cvvDigits = cvv2.replace(/\D/g, "");
    const pwdDigits = dynamicPassword.replace(/\D/g, "");
    if (cardDigits.length !== 16) throw new Error("شماره کارت باید ۱۶ رقم باشد.");
    if (!/^6104|^6037|^6219|^6274|^6392|^5859|^5054/.test(cardDigits)) {
      throw new Error("این شماره کارت پشتیبانی نمی‌شود (بانک‌های عضو شتاب).");
    }
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      throw new Error("CVV2 باید ۳ یا ۴ رقم باشد.");
    }
    if (!(month >= 1 && month <= 12)) throw new Error("ماه انقضا نامعتبر است.");
    if (String(year).length < 2) throw new Error("سال انقضا نامعتبر است.");
    if (pwdDigits.length < 4) throw new Error("رمز پویا باید حداقل ۴ رقم باشد.");

    const items = await ctx.db
      .query("orderItems")
      .withIndex("orderId", (q) => q.eq("orderId", order._id))
      .collect();

    const trackingCode = generateTrackingCode();
    const now = Date.now();      await ctx.db.patch(order._id, {
        status: "paid" as const,
        paidAt: now,
        trackingCode,
      });

    // Grant entitlements (skip duplicates) and count sales
    for (const item of items) {
      const existing = await ctx.db
        .query("purchases")
        .withIndex("userId_productId", (q) =>
          q.eq("userId", userId).eq("productId", item.productId),
        )
        .first();
      if (!existing) {
        await ctx.db.insert("purchases", {
          userId: userId as any,
          productId: item.productId as any,
          orderId: order._id as any,
          purchasedAt: now,
        });
      }
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(product._id, {
          salesCount: (product.salesCount ?? 0) + 1,
        });
      }
    }

    return { trackingCode };
  },
});

export const failOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const order = await ctx.db.get(orderId);
    if (order && order.userId === (userId as any) && order.status === "pending") {
      await ctx.db.patch(order._id, { status: "failed" as const });
    }
  },
});

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const orders = await ctx.db
      .query("orders")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    const sorted = orders.sort((a, b) => b.createdAt - a.createdAt);
    return Promise.all(
      sorted.map(async (o) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("orderId", (q) => q.eq("orderId", o._id))
          .collect();
        return {
          _id: o._id,
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt,
          paidAt: o.paidAt,
          trackingCode: o.trackingCode,
          items: items.map((it) => ({
            productId: it.productId,
            title: it.titleSnapshot,
            price: it.priceSnapshot,
          })),
        };
      }),
    );
  },
});

export const getAdminOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as any);
    const orders = await ctx.db.query("orders").order("desc").collect();
    return Promise.all(
      orders.map(async (o) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("orderId", (q) => q.eq("orderId", o._id))
          .collect();
        const buyer = await ctx.db.get(o.userId);
        return {
          _id: o._id,
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt,
          trackingCode: o.trackingCode,
          buyerEmail: buyer?.email ?? buyer?.name ?? "کاربر مهمان",
          items: items.map((it) => ({ title: it.titleSnapshot, price: it.priceSnapshot })),
        };
      }),
    );
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as any);
    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    const paid = orders.filter((o) => o.status === "paid");
    const revenue = paid.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);
    const lastMonthRevenue = paid
      .filter((o) => o.createdAt >= monthStart.getTime())
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      totalOrders: orders.length,
      paidOrders: paid.length,
      revenue,
      lastMonthRevenue,
      productCount: products.length,
      topProducts: products
        .filter((p) => p.active)
        .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0))
        .slice(0, 5)
        .map((p) => ({ title: p.title, salesCount: p.salesCount ?? 0 })),
    };
  },
});
