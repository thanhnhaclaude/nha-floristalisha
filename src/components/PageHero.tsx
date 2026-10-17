import Link from "next/link";

export default function PageHero({
  eyebrow,
  title,
  intro,
  crumb,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  crumb: string;
}) {
  return (
    <section className="border-b border-line">
      <div className="container-x pb-14 pt-10 md:pb-20 md:pt-16">
        <nav aria-label="Breadcrumb" className="eyebrow text-[0.68rem] text-ink-soft">
          <Link href="/" className="link-u">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{crumb}</span>
        </nav>
        <p className="eyebrow mt-8 text-poppy">{eyebrow}</p>
        <h1 className="mt-4 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.04em]">{title}</h1>
        {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</div>}
      </div>
    </section>
  );
}
