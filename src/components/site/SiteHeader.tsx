import { ShoppingBag, UserRound, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { LogoWordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { toFa } from "@/lib/format";

const NAV_ITEMS = [
  { to: "/", label: "خانه" },
  { to: "/store", label: "فروشگاه" },
  { to: "/library", label: "کتابخانه من" },
  { to: "/orders", label: "سفارش‌ها" },
];

export function SiteHeader() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <LogoWordmark onClick={() => navigate("/")} />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
              >
                <LayoutDashboard className="size-4" />
                پنل مدیریت
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            aria-label="سبد خرید"
          >
            <Button variant="outline" size="icon" className="rounded-xl pointer-events-none">
              <ShoppingBag className="size-4" />
            </Button>
            {count > 0 && (
              <span className="tnum absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white">
                {toFa(count)}
              </span>
            )}
          </Link>
          <ThemeToggle />
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />
          ) : isAuthenticated ? (
            <Button
              variant="ghost"
              className="rounded-xl gap-2"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <UserRound className="size-4" />
              خروج
            </Button>
          ) : (
            <Button
              className="rounded-xl gradient-primary text-white hover:opacity-90"
              onClick={() => navigate("/auth?returnTo=" + encodeURIComponent("/store"))}
            >
              ورود / ثبت‌نام
            </Button>
          )}
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            to="/admin"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-primary"
          >
            پنل مدیریت
          </Link>
        )}
      </nav>
    </header>
  );
}
