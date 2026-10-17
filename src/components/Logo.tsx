import Link from "next/link";

export default function Logo({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Florist Alisha — home"
      className={`group inline-flex items-baseline gap-2 leading-none ${light ? "text-paper" : "text-ink"}`}
    >
      <span className="font-display text-[1.9rem] font-medium italic tracking-tight md:text-[2.1rem]">Alisha</span>
      <span className="eyebrow text-[0.62rem] tracking-[0.3em]">
        Florist<span className="text-poppy">.</span>
      </span>
    </Link>
  );
}
