import { cn } from "@/lib/utils";
import { coverGradient } from "@/lib/covers";

/**
 * A CSS-generated book cover — no image assets needed.
 * Renders a gradient "binding", faux title typography and page edge.
 */
export function ProductCover({
  title,
  author,
  coverFrom,
  coverTo,
  className,
}: {
  title: string;
  author?: string;
  coverFrom: number;
  coverTo: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] flex-col overflow-hidden rounded-l-xl rounded-r-md shadow-md",
        className,
      )}
      style={{ background: coverGradient(coverFrom, coverTo) }}
      dir="rtl"
    >
      {/* spine */}
      <div className="absolute inset-y-0 right-0 w-3 bg-black/20" />
      <div className="absolute inset-y-0 right-3 w-px bg-white/30" />
      {/* decorative circles */}
      <div className="absolute -left-8 -top-10 size-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-6 size-36 rounded-full bg-white/10" />
      {/* page edge */}
      <div className="absolute inset-y-1 left-0.5 w-1 rounded-l bg-white/60" />
      {/* text */}
      <div className="flex flex-1 flex-col justify-between p-4 pl-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          PDF
        </span>
        <div>
          <h3 className="text-lg font-extrabold leading-7 text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.25)]">
            {title}
          </h3>
          {author && (
            <p className="mt-1.5 text-xs font-medium text-white/80">{author}</p>
          )}
        </div>
      </div>
    </div>
  );
}
