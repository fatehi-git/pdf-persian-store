import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Infinity as InfinityIcon,
  Layers,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductCover } from "@/components/store/ProductCover";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { toFa } from "@/lib/format";
import type { StoreProduct } from "@/convex/products";

const FEATURES = [
  {
    icon: Zap,
    title: "دانلود آنی",
    text: "بلافاصله پس از پرداخت، فایل PDF کتاب در کتابخانه شما آماده دانلود است.",
  },
  {
    icon: ShieldCheck,
    title: "پرداخت امن",
    text: "درگاه بانکی با رمز پویا و رمزنگاری کامل — دقیقاً مثل خرید کارت‌خوانی.",
  },
  {
    icon: InfinityIcon,
    title: "دسترسی مادام‌العمر",
    text: "یک بار بخرید، همیشه داشته باشید. کتاب‌ها هیچ‌وقت از کتابخانه‌تان حذف نمی‌شوند.",
  },
  {
    icon: Layers,
    title: "کیفیت چاپی",
    text: "فایل‌های PDF با کیفیت بالا، فهرست تعاملی و تایپوگرافی تمیز فارسی.",
  },
];

const CATEGORIES = [
  "برنامه‌نویسی",
  "طراحی و گرافیک",
  "کسب‌وکار",
  "علوم انسانی",
  "مکمل دانشگاهی",
  "سبک زندگی",
] as const;

const STEPS = [
  { icon: BookOpen, title: "کتاب را انتخاب کن", text: "بین ده‌ها عنوان تخصصی PDF گشت بزنید و کتاب مناسب‌تان را پیدا کنید." },
  { icon: Lock, title: "امن پرداخت کن", text: "با کارت بانکی، CVV2 و رمز پویا — دقیقاً مثل هر خرید اینترنتی دیگر." },
  { icon: Download, title: "همین حالا بخوان", text: "فایل PDF بلافاصله در کتابخانه‌تان آماده دانلود و مطالعه است." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const products = useQuery(api.products.list, {}) as StoreProduct[] | undefined;

  const featured = useMemo(
    () => (products ?? []).filter((p) => p.featured).slice(0, 3),
    [products],
  );
  const latest = useMemo(() => (products ?? []).slice(0, 8), [products]);

  // Deterministic floating books for the hero stack
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="dot-grid relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-5 gap-1.5 rounded-full gradient-primary px-3 py-1 text-white border-0">
                <Sparkles className="size-3.5" />
                بیش از {toFa(5200)} کتاب دیجیتال فروخته‌شده
              </Badge>
              <h1 className="text-4xl font-extrabold leading-[1.25] tracking-tight sm:text-5xl">
                کتابخونه‌ات را <span className="text-gradient">دیجیتالی</span> بساز
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
                پی‌دی‌اف‌استور فروشگاه کتاب‌های PDF فارسی است: انتخاب کن، با درگاه
                امن بانکی پرداخت کن و همان لحظه بخوان. بدون ارسال، بدون انتظار —
                فقط خواندن.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 rounded-xl gradient-primary px-8 text-base text-white hover:opacity-90"
                  onClick={() => navigate("/store")}
                >
                  <ShoppingBag className="size-5" />
                  ورود به فروشگاه
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl px-8 text-base"
                  onClick={() => navigate(isAuthenticated ? "/library" : "/auth?returnTo=" + encodeURIComponent("/library"))}
                >
                  کتابخانه من
                  <ArrowLeft className="size-5" />
                </Button>
              </div>
              {/* stats */}
              <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  { num: "+۵۲۰۰", label: "دانلود موفق" },
                  { num: "۴٫۹", label: "امتیاز رضایت" },
                  { num: "۲۴/۷", label: "پشتیبانی" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border bg-card/60 p-4 text-center backdrop-blur">
                    <p className="text-xl font-extrabold text-primary">{s.num}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating book stack */}
            <div className="relative mx-auto hidden h-[420px] w-full max-w-md sm:block">
              {featured.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 40, rotate: 0 }}
                  animate={
                    ready
                      ? {
                          opacity: 1,
                          y: [0, -10, 0],
                          rotate: [-8 + i * 9, -6 + i * 9, -8 + i * 9],
                        }
                      : {}
                  }
                  transition={{
                    opacity: { duration: 0.5, delay: i * 0.15 },
                    rotate: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="absolute"
                  style={{
                    top: 30 + i * 90,
                    left: `${8 + i * 30}%`,
                    zIndex: 10 - i,
                  }}
                >
                  <ProductCover
                    title={p.title}
                    author={p.author}
                    coverFrom={p.coverFrom}
                    coverTo={p.coverTo}
                    className="w-40 rotate-0 shadow-2xl"
                  />
                </motion.div>
              ))}
              <div className="absolute bottom-6 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-2xl" />
            </div>
          </div>
        </section>

        {/* ============ LATEST / GRID ============ */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                کتاب‌های <span className="text-gradient">پرفروش</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                محبوب‌ترین کتاب‌های دیجیتال این هفته
              </p>
            </div>
            <Link
              to="/store"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              مشاهده همه
              <ArrowLeft className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {(products ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              در حال آماده‌سازی فروشگاه…
            </p>
          )}
        </section>

        {/* ============ FEATURES ============ */}
        <section className="border-y bg-card/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                چرا پی‌دی‌اف‌استور؟
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                تجربه‌ای سریع، امن و ماندگار از خرید کتاب دیجیتال
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  <Card className="card-hover h-full border-border/70">
                    <CardContent className="p-6">
                      <div className="mb-4 flex size-11 items-center justify-center rounded-xl gradient-primary text-white shadow">
                        <f.icon className="size-5" />
                      </div>
                      <h3 className="text-base font-bold">{f.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              دسته‌بندی‌ها
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              کتاب تخصصی خودت را در دسته‌بندی موردعلاقه پیدا کن
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/store?category=${encodeURIComponent(c)}`}
                className="rounded-2xl border bg-card px-5 py-3 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        {/* ============ STEPS ============ */}
        <section className="border-y bg-secondary/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                در ۳ قدم صاحب کتاب شو
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative rounded-2xl border bg-card p-6 text-center">
                  <span className="tnum absolute -top-4 right-6 flex size-8 items-center justify-center rounded-full gradient-primary text-sm font-extrabold text-white shadow">
                    {toFa(i + 1)}
                  </span>
                  <div className="mx-auto mb-4 mt-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="size-6" />
                  </div>
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SOCIAL PROOF ============ */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <div className="mb-3 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              خوانندگان چه می‌گویند؟
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "پویا محمدی", role: "توسعه‌دهنده بک‌اند", text: "کتاب مهندسی نرم‌افزار دقیقاً همان چیزی بود که برای ارتقای شغلی‌ام لازم داشتم. پرداخت و دانلود کمتر از یک دقیقه طول کشید." },
              { name: "الهام رضایی", role: "طراح UI/UX", text: "کیفیت فایل‌ها فوق‌العاده است و تایپوگرافی فارسی واقعاً تمیز. کتابخانه من الان پر از کتاب‌های پی‌دی‌اف‌استور است." },
              { name: "سعید کریمی", role: "دانشجوی ارشد", text: "جزوه ریاضیات گسسته نجات‌دهنده‌ام بود. قیمت مناسب، محتوای عالی و پشتیبانی سریع." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/70">
                  <CardContent className="p-6">
                    <p className="text-sm leading-7 text-muted-foreground">«{t.text}»</p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="gradient-primary relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
            <div className="absolute -left-10 -top-10 size-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-14 -right-8 size-56 rounded-full bg-white/10" />
            <h2 className="relative text-2xl font-extrabold sm:text-3xl">
              همین امروز کتاب بعدی‌ات را انتخاب کن
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              ثبت‌نام کمتر از یک دقیقه طول می‌کشد و اولین کتاب‌تان فقط چند کلیک با شما فاصله دارد.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-xl bg-white px-8 text-base font-bold text-primary hover:bg-white/90"
                onClick={() => navigate("/store")}
              >
                شروع خرید
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/40 bg-transparent px-8 text-base font-bold text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/auth?returnTo=" + encodeURIComponent("/store"))}
              >
                ورود / ثبت‌نام
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
