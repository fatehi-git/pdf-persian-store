import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/** Products the signed-in user owns (entitlements with product details). */
export const getMyPurchases = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("purchases")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    const sorted = rows.sort((a, b) => b.purchasedAt - a.purchasedAt);
    return Promise.all(
      sorted.map(async (row) => {
        const product = await ctx.db.get(row.productId);
        if (!product) {
          return {
            _id: row._id,
            productId: null,
            purchasedAt: row.purchasedAt,
            product: null,
          };
        }
        return {
          _id: row._id,
          productId: product._id,
          purchasedAt: row.purchasedAt,
          product: {
            title: product.title,
            subtitle: product.subtitle,
            author: product.author,
            category: product.category,
            pages: product.pages,
            language: product.language,
            edition: product.edition,
            coverFrom: product.coverFrom,
            coverTo: product.coverTo,
          },
        };
      }),
    );
  },
});

/** Which product ids the current user owns — used to mark store cards "خریده‌شده". */
export const getOwnedProductIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("purchases")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    return rows.map((r) => r.productId);
  },
});
