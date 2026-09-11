import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const PRODUCT_CATEGORIES = [
  "برنامه‌نویسی",
  "طراحی و گرافیک",
  "کسب‌وکار",
  "علوم انسانی",
  "مکمل دانشگاهی",
  "سبک زندگی",
] as const;

export const productCategoryValidator = v.union(
  ...PRODUCT_CATEGORIES.map((c) => v.literal(c)),
);
export type ProductCategory = Infer<typeof productCategoryValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // PDFStore: catalog of downloadable PDF books
    products: defineTable({
      title: v.string(),
      subtitle: v.optional(v.string()),
      author: v.string(),
      description: v.string(),
      category: productCategoryValidator,
      price: v.number(), // تومان
      pages: v.number(),
      language: v.optional(v.string()),
      edition: v.optional(v.string()),
      coverFrom: v.number(), // gradient start color for the generated cover
      coverTo: v.number(), // gradient end color (hue degrees)
      featured: v.optional(v.boolean()),
      active: v.boolean(),
      salesCount: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("active", ["active"])
      .index("category", ["category"])
      .index("featured", ["featured"]),

    // PDFStore: a simulated payment order (one checkout session)
    orders: defineTable({
      userId: v.id("users"),
      totalAmount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
      ),
      createdAt: v.number(),
      paidAt: v.optional(v.number()),
      trackingCode: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("status", ["status"]),

    // PDFStore: line items of an order (price snapshot at purchase time)
    orderItems: defineTable({
      orderId: v.id("orders"),
      productId: v.id("products"),
      titleSnapshot: v.string(),
      priceSnapshot: v.number(),
    })
      .index("orderId", ["orderId"])
      .index("productId", ["productId"]),

    // PDFStore: entitlement — a user owns this PDF and can download it
    purchases: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      orderId: v.id("orders"),
      purchasedAt: v.number(),
    })
      .index("userId", ["userId"])
      .index("productId", ["productId"])
      .index("userId_productId", ["userId", "productId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
