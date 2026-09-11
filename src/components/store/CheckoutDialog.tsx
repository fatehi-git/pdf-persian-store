import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cart, type CartItem } from "@/lib/cart";
import { faNumber, toFa, groupCardNumber, toEn } from "@/lib/format";
import { coverGradient } from "@/lib/covers";

type Step = "form" | "processing" | "success" | "failed";

/** Realistic Shetab-style gateway chrome — fully simulated, no real money. */
export function CheckoutDialog({
  open,
  onOpenChange,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid: () => void;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const orderIdRef = useRef<string | null>(null);

  // form fields
  const [card, setCard] = useState("");
  const [cvv2, setCvv2] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [pwd, setPwd] = useState("");

  const createPendingOrder = useMutation(api.orders.createPendingOrder);
  const payOrder = useMutation(api.orders.payOrder);
  const failOrder = useMutation(api.orders.failOrder);

  // Snapshot cart when the dialog opens
  useEffect(() => {
    if (open) {
      const snapshot = cart.get();
      if (snapshot.length === 0) {
        onOpenChange(false);
        return;
      }
      setItems(snapshot);
      setAmount(snapshot.reduce((s, i) => s + i.price, 0));
      setStep("form");
      setError(null);
      setTrackingCode(null);

      createPendingOrder({ productIds: snapshot.map((i) => i.productId) })
        .then((res) => {
          orderIdRef.current = res.orderId;
        })
        .catch((e) => {
          toast.error(e instanceof Error ? e.message : "خطا در ایجاد سفارش");
          onOpenChange(false);
        });
    }
  }, [open, createPendingOrder, onOpenChange]);

  const reset = () => {
    setCard("");
    setCvv2("");
    setMonth("");
    setYear("");
    setPwd("");
    setError(null);
  };

  const closeAll = () => {
    if (step === "processing") return;
    onOpenChange(false);
    setTimeout(() => {
      if (step !== "success") {
        const id = orderIdRef.current;
        if (id) void failOrder({ orderId: id }).catch(() => {});
        reset();
        setStep("form");
      }
    }, 200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderIdRef.current;
    if (!id) {
      toast.error("سفارش آماده نیست، دوباره تلاش کنید.");
      return;
    }
    setError(null);
    setStep("processing");

    // Simulate gateway latency
    await new Promise((r) => setTimeout(r, 1400));

    try {
      const res = await payOrder({
        orderId: id,
        cardNumber: toEn(card).replace(/\s/g, ""),
        cvv2: toEn(cvv2),
        month: Number(toEn(month)) || 0,
        year: Number(toEn(year)) || 0,
        dynamicPassword: toEn(pwd),
      });
      setTrackingCode(res.trackingCode);
      setStep("success");
      cart.clear();
      onPaid();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "پرداخت ناموفق بود. دوباره تلاش کنید.";
      setError(message);
      setStep("failed");
      const id = orderIdRef.current;
      if (id) void failOrder({ orderId: id }).catch(() => {});
    }
  };

  const cardOk = toEn(card).replace(/\s/g, "").length === 16;
  const cvvOk = toEn(cvv2).length >= 3;
  const monthOk = Number(toEn(month)) >= 1 && Number(toEn(month)) <= 12;
  const yearOk = toEn(year).length >= 2;
  const pwdOk = toEn(pwd).length >= 4;
  const canPay = cardOk && cvvOk && monthOk && yearOk && pwdOk;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : closeAll())}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0" dir="rtl">
        {step === "success" ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full gradient-success">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            <h3 className="text-xl font-extrabold">پرداخت با موفقیت انجام شد</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              کد رهگیری: <span className="tnum font-bold text-foreground" dir="ltr">{trackingCode}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              کتاب‌ها به کتابخانه شما اضافه شدند.
            </p>
            <div className="mt-6 flex w-full flex-col gap-2">
              <Button
                className="rounded-xl gradient-success text-white hover:opacity-90"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/library");
                }}
              >
                رفتن به کتابخانه من
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => {
                onOpenChange(false);
                navigate("/orders");
              }}>
                مشاهده سفارش‌ها
              </Button>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              این یک درگاه پرداخت شبیه‌سازی‌شده است؛ هیچ مبلغ واقعی کسر نشده است.
            </p>
          </div>
        ) : (
          <div className="grid">
            {/* Gateway header */}
            <div className="gradient-primary flex items-center justify-between px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5" />
                <span className="text-sm font-bold">درگاه پرداخت اینترنتی پی‌دی‌اف‌استور</span>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="rounded-lg p-1 transition-colors hover:bg-white/15"
                aria-label="انصراف"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              {/* Amount */}
              <div className="mb-4 rounded-xl bg-secondary/60 p-4 text-center">
                <p className="text-xs text-secondary-foreground/80">مبلغ قابل پرداخت</p>
                <p className="tnum mt-1 text-2xl font-extrabold text-primary">
                  {faNumber(amount)} <span className="text-sm font-medium">تومان</span>
                </p>
              </div>

              {/* Items */}
              <div className="mb-4 space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 rounded-lg border p-2">
                    <div
                      className="h-10 w-7 shrink-0 rounded-[4px] shadow-sm"
                      style={{ background: coverGradient(item.coverFrom, item.coverTo) }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">{item.author}</p>
                    </div>
                    <span className="tnum text-xs font-bold text-muted-foreground">
                      {faNumber(item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {step === "failed" && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold">شماره کارت</label>
                  <Input
                    inputMode="numeric"
                    placeholder="۶۰۳۷ ۹۹۱۱ ۲۳۴۵ ۶۰۹۰"
                    className="ltr-input h-11 rounded-xl text-center text-base"
                    value={card}
                    onChange={(e) => {
                      const digits = toEn(e.target.value).replace(/\D/g, "").slice(0, 16);
                      setCard(groupCardNumber(digits));
                    }}
                    disabled={step === "processing"}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">CVV2</label>
                    <Input
                      inputMode="numeric"
                      placeholder="۱۲۳"
                      className="ltr-input h-11 rounded-xl text-center"
                      value={cvv2}
                      onChange={(e) => setCvv2(toEn(e.target.value).replace(/\D/g, "").slice(0, 4))}
                      disabled={step === "processing"}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">ماه</label>
                    <Input
                      inputMode="numeric"
                      placeholder="۰۸"
                      className="ltr-input h-11 rounded-xl text-center"
                      value={month}
                      onChange={(e) => setMonth(toEn(e.target.value).replace(/\D/g, "").slice(0, 2))}
                      disabled={step === "processing"}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">سال</label>
                    <Input
                      inputMode="numeric"
                      placeholder="۰۵"
                      className="ltr-input h-11 rounded-xl text-center"
                      value={year}
                      onChange={(e) => setYear(toEn(e.target.value).replace(/\D/g, "").slice(0, 2))}
                      disabled={step === "processing"}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
                    <span>رمز پویا (رمز دوم)</span>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-primary hover:underline"
                      onClick={() => {
                        setPwd(Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(""));
                        toast.info("رمز پویا نمونه برای شما ارسال شد (شبیه‌سازی)");
                      }}
                    >
                      دریافت رمز پویا
                    </button>
                    <span hidden>{pwdOk ? "" : ""}</span>
                  </label>
                  <Input
                    inputMode="numeric"
                    placeholder="------"
                    className="ltr-input h-11 rounded-xl text-center"
                    value={pwd}
                    onChange={(e) => setPwd(toEn(e.target.value).replace(/\D/g, "").slice(0, 8))}
                    disabled={step === "processing"}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl gradient-primary text-white hover:opacity-90"
                  disabled={!canPay || step === "processing"}
                >
                  {step === "processing" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      در حال پردازش پرداخت…
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      پرداخت {faNumber(amount)} تومان
                    </>
                  )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  اتصال شما امن است — شبیه‌سازی درگاه بانکی، هیچ مبلغ واقعی کسر نمی‌شود
                </p>
                <p hidden>
                  <Banknote className="size-3" />
                </p>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
