import { BookOpen, FileText, Languages, Layers, ShoppingBag, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductCover } from "./ProductCover";
import { cart } from "@/lib/cart";
import { faToman, toFa } from "@/lib/format";
import type { StoreProduct } from "@/convex/products";
import { toast } from "sonner";

export function QuickViewDialog({
  product,
  owned,
  open,
  onOpenChange,
}: {
  product: StoreProduct;
  owned?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const addToCart = () => {
    if (cart.add(product)) {
      toast.success(`«${product.title}» به سبد خرید اضافه شد`);
      onOpenChange(false);
    } else {
      toast.info("این کتاب از قبل در سبد خرید هست");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0" dir="rtl">
        <div className="grid sm:grid-cols-[200px_1fr]">
          <div className="gradient-primary hidden items-center justify-center p-6 sm:flex">
            <ProductCover
              title={product.title}
              author={product.author}
              coverFrom={product.coverFrom}
              coverTo={product.coverTo}
              className="w-36 rotate-[-4deg]"
            />
          </div>
          <div className="p-6">
            <DialogHeader className="space-y-2 text-right">
              <DialogTitle className="text-xl font-extrabold">
                {product.title}
              </DialogTitle>
              {product.subtitle && (
                <DialogDescription className="text-sm">
                  {product.subtitle}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <BookOpen className="size-3" />
                {product.category}
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <UserRound className="size-3" />
                {product.author}
              </Badge>
              {product.edition && (
                <Badge variant="outline" className="gap-1.5">
                  <Layers className="size-3" />
                  {product.edition}
                </Badge>
              )}
            </div>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>

            <Separator className="my-4" />

            <div className="tnum grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
              <div>
                <FileText className="mx-auto mb-1 size-4 text-primary" />
                {toFa(product.pages)} صفحه
              </div>
              <div>
                <Languages className="mx-auto mb-1 size-4 text-primary" />
                {product.language ?? "فارسی"}
              </div>
              <div>
                <BookOpen className="mx-auto mb-1 size-4 text-primary" />
                PDF دیجیتال
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="tnum text-2xl font-extrabold text-primary">
                {faToman(product.price)}
              </span>
              {owned ? (
                <Button
                  className="rounded-xl gradient-success text-white hover:opacity-90"
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/library");
                  }}
                >
                  در کتابخانه من
                </Button>
              ) : (
                <Button
                  className="rounded-xl gradient-primary text-white hover:opacity-90"
                  onClick={addToCart}
                >
                  <ShoppingBag className="size-4" />
                  افزودن به سبد
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
