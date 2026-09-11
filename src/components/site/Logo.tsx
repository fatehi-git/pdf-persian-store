import { cn } from "@/lib/utils";

/** Inline-SVG PDFStore mark: a stylized document with a page fold. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pdfstore-g" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.55" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#pdfstore-g)" />
      <path
        d="M14 10.5H22.5L27 15V29.5C27 29.7761 26.7761 30 26.5 30H14C13.7239 30 13.5 29.7761 13.5 29.5V11C13.5 10.7239 13.7239 10.5 14 10.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M22.5 10.5L27 15H23.25C22.8358 15 22.5 14.6642 22.5 14.25V10.5Z"
        fill="white"
        fillOpacity="0.7"
      />
      <rect x="16.5" y="19" width="8" height="1.6" rx="0.8" fill="#6366F1" fillOpacity="0.85" />
      <rect x="16.5" y="22.4" width="8" height="1.6" rx="0.8" fill="#8B5CF6" fillOpacity="0.7" />
      <rect x="16.5" y="25.8" width="5" height="1.6" rx="0.8" fill="#06B6D4" fillOpacity="0.7" />
    </svg>
  );
}

/** Wordmark: icon + Persian name. */
export function LogoWordmark({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
    >
      <LogoMark />
      <span className="text-lg font-extrabold tracking-tight">
        پی‌دی‌اف<span className="text-gradient">استور</span>
      </span>
    </button>
  );
}
