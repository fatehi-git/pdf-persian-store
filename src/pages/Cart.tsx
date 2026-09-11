import { useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CheckoutDialog } from "@/components/store/CheckoutDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { cart } from "@/lib/cart";
import { faNumber, faToman } from "@/lib/format";
import { coverGradient } from "@/lib/covers";

export default function Cart() {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const { isAuthenticated } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const startCheckout = () => {
    if (!isAuthenticated) {
      navigate("/auth?returnTo=" + encodeURIComponent("/cart"));
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight">سبد خرید</h1>

          {items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-3xl border bg-card py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="size-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold">سبد خرید شما خالی است</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                از فروشگاه، کتاب‌های موردعلاقه‌تان را اضافه کنید.
              </p>
              <Button
                className="mt-6 rounded-xl gradient-primary text-white hover:opacity-90"
                onClick={() => navigate("/store")}
              >
                رفتن به فروشگاه
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
              {/* items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.productId} className="p-0">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className="h-20 w-15 shrink-0 rounded-lg shadow"
                        style={{ background: coverGradient(item.coverFrom, item.coverTo) }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold">{item.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.author}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="tnum text-sm font-extrabold text-primary">
                          {faToman(item.price)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 rounded-lg text-xs text-destructive hover:text-destructive"
                          onClick={() => cart.remove(item.productId)}
                        >
                          <Trash2 className="size-3.5" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* summary */}
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-base font-bold">خلاصه سفارش</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>تعداد کتاب‌ها</span>
                        <span className="tnum">{faNumber(items.length)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>مالیات و هزینه ارسال</span>
                        <span>رایگان (دیجیتال)</span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">مبلغ نهایی</span>
                      <span className="tnum text-xl font-extrabold text-primary">
                        {faToman(total)}
                      </span>
                    </div>
                    <Button
                      className="mt-6 h-12 w-full rounded-xl gradient-primary text-base text-white hover:opacity-90"
                      onClick={startCheckout}
                    >
                      پرداخت امن
                    </Button>
                    <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
                      با تکمیل خرید، فایل‌ها بلافاصله در کتابخانه شما قرار می‌گیرند.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onPaid={() => navigate("/library")}
      />
    </div>
  );
}
