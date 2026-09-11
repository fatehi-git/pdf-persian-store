import { Link } from "react-router";
import { LogoWordmark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <LogoWordmark />
          <p className="text-sm leading-6 text-muted-foreground">
            فروشگاه آنلاین کتاب‌های دیجیتال PDF — پرداخت امن، دانلود بی‌درنگ،
            دسترسی مادام‌العمر.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">دسترسی سریع</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-primary" to="/store">فروشگاه</Link></li>
            <li><Link className="hover:text-primary" to="/library">کتابخانه من</Link></li>
            <li><Link className="hover:text-primary" to="/orders">سفارش‌های من</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">راهنما</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>پرسش‌های متداول</li>
            <li>قوانین بازگشت وجه</li>
            <li>حریم خصوصی</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">تماس با ما</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>پشتیبانی ۲۴/۷</li>
            <li>support@pdfstore.ir</li>
            <li>تهران، ایران</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} پی‌دی‌اف‌استور — همه حقوق محفوظ است.
      </div>
    </footer>
  );
}
