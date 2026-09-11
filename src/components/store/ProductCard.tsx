import { BadgeCheck, BookOpen, Eye, FileDown, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCover } from "./ProductCover";
import { QuickViewDialog } from "./QuickViewDialog";
import { cart } from "@/lib/cart";
import { faToman, faNumber, toFa } from "@/lib/format";
import type { StoreProduct } from "@/convex/products";
import { toast } from "sonner";
import { useState } from "react";

export function ProductCard({
  product,
  owned,
}: {
  product: StoreProduct;
  owned?: boolean;
}) {
  const [quickOpen, setQuickOpen] = useState(false);

  const addToCart = () => {
    if (cart.add(product)) {
      toast.success(`«${product.title}» به سبد خرید اضافه شد`);
    } else {
      toast.info("این کتاب از قبل در سبد خرید هست");
    }
  };

  return (
    <Card className="card-hover group flex h-full flex-col overflow-hidden border-border/70 p-0">
      <div className="relative p-5 pb-0">
        <ProductCover
          title={product.title}
          author={product.author}
          coverFrom={product.coverFrom}
          coverTo={product.coverTo}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute right-8 top-7 flex flex-col gap-1.5">
          {product.featured && (
            <span className="rounded-full gradient-primary px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              ویژه
            </span>
          )}
          {owned && (
            <span className="flex items-center gap-1 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              <BadgeCheck className="size-3" />
              خریده‌شده
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="absolute bottom-3 left-3 rounded-full bg-background/85 p-2 text-foreground opacity-0 shadow backdrop-blur transition-all hover:scale-105 group-hover:opacity-100"
          aria-label="نمایش سریع"
        >
          <Eye className="size-4" />
        </button>
      </div>

      <CardContent className="flex flex-1 flex-col p-5 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-[11px]">
            <BookOpen className="size-3" />
            {product.category}
          </Badge>
          <span className="tnum text-[11px] text-muted-foreground">
            {toFa(product.pages)} صفحه
          </span>
        </div>
        <h3 className="line-clamp-1 text-base font-bold">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="tnum text-sm font-extrabold text-primary">
            {faToman(product.price)}
          </span>
          {owned ? (
            <Button
              size="sm"
              className="rounded-xl gradient-success text-white hover:opacity-90"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("pdfstore:download", {
                    detail: product._id,
                  }),
                )
              }
            >
              <FileDown className="size-4" />
              دانلود
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-xl gradient-primary text-white hover:opacity-90"
              onClick={addToCart}
            >
              <ShoppingBag className="size-4" />
              افزودن
            </Button>
          )}
        </div>
        <p className="tnum mt-2 text-[11px] text-muted-foreground">
          {faNumber(product.salesCount ?? 0)} فروش
        </p>
      </CardContent>

      <QuickViewDialog
        product={product}
        owned={owned}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </Card>
  );
}
