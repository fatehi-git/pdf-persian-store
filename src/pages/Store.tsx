import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { BookOpen, Search, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import type { StoreProduct } from "@/convex/products";

const CATEGORIES = [
  "همه",
  "برنامه‌نویسی",
  "طراحی و گرافیک",
  "کسب‌وکار",
  "علوم انسانی",
  "مکمل دانشگاهی",
  "سبک زندگی",
] as const;

type SortKey = "popular" | "newest" | "price-asc" | "price-desc";

export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "همه";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  const products = useQuery(api.products.list, {}) as StoreProduct[] | undefined;
  const ownedIds = useQuery(api.purchases.getOwnedProductIds, {}) as string[] | undefined;

  const ownedSet = useMemo(() => new Set(ownedIds ?? []), [ownedIds]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (activeCategory !== "همه") {
      list = list.filter((p) => p.category === activeCategory);
    }
    const q = query.trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.includes(q) ||
          p.author.includes(q) ||
          p.description.includes(q),
      );
    }
    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        sorted.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
    }
    return sorted;
  }, [products, activeCategory, query, sort]);

  const setCategory = (c: string) => {
    setSearchParams(c === "همه" ? {} : { category: c }, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* page head */}
        <div className="border-b bg-secondary/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
            <h1 className="text-3xl font-extrabold tracking-tight">فروشگاه کتاب‌های PDF</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {products
                ? `${toFa(filtered.length)} کتاب در این دسته‌بندی`
                : "در حال بارگذاری…"}
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          {/* toolbar */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجوی عنوان، نویسنده یا موضوع…"
                className="h-11 rounded-xl pr-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-11 w-44 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">پرفروش‌ترین</SelectItem>
                  <SelectItem value="newest">جدیدترین</SelectItem>
                  <SelectItem value="price-asc">ارزان‌ترین</SelectItem>
                  <SelectItem value="price-desc">گران‌ترین</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* category chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-bold transition-all",
                  activeCategory === c
                    ? "gradient-primary border-transparent text-white shadow"
                    : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* grid */}
          {products === undefined ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold">کتابی پیدا نشد</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                عبارت جستجو یا دسته‌بندی را تغییر دهید.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => {
                  setQuery("");
                  setCategory("همه");
                }}
              >
                پاک کردن فیلترها
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} owned={ownedSet.has(p._id)} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
