"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Lock } from "lucide-react";
import { addOns, sizes, quote, usd, FREE_DELIVERY_OVER, type AddOnId, type Product, type SizeId } from "@/lib/catalog";
import { earliestDeliveryDate, latestDeliveryDate, fieldErrors, orderSchema } from "@/lib/schemas";
import { US_STATES } from "@/lib/site";

type Errors = Record<string, string>;

export default function OrderForm({ product }: { product: Product }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [size, setSize] = useState<SizeId>("classic");
  const [extras, setExtras] = useState<AddOnId[]>([]);
  const [card, setCard] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");

  const q = useMemo(() => quote(product, size, extras), [product, size, extras]);
  const minDate = useMemo(() => earliestDeliveryDate(), []);
  const maxDate = useMemo(() => latestDeliveryDate(), []);

  const toggleExtra = (id: AddOnId) =>
    setExtras((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(fd.entries()),
      productSlug: product.slug,
      size: product.singleSize ? "classic" : size,
      addOns: extras,
    };
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      focusFirst(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    setServerMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          focusFirst(data.errors);
        }
        setServerMsg(data.message || "Something went wrong. Please try again or call us.");
        setStatus("error");
        return;
      }
      router.push(`/order/thank-you?ref=${encodeURIComponent(data.id)}`);
    } catch {
      setServerMsg("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function focusFirst(errs: Errors) {
    const first = Object.keys(errs)[0];
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const err = (n: string) => errors[n];
  const fieldProps = (n: string) => ({
    id: n,
    name: n,
    "aria-invalid": err(n) ? true : undefined,
    "aria-describedby": err(n) ? `${n}-error` : undefined,
    onChange: () => err(n) && setErrors(({ [n]: _, ...rest }) => rest),
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-10">
      {!product.singleSize && (
        <fieldset>
          <legend className="eyebrow mb-4">1 · Choose a size</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {sizes.map((s) => {
              const active = size === s.id;
              return (
                <label
                  key={s.id}
                  className={`relative flex cursor-pointer flex-col rounded-2xl border-[1.5px] p-3.5 transition-colors md:p-4 ${
                    active ? "border-ink bg-card" : "border-line hover:border-ink/50"
                  }`}
                >
                  <input type="radio" name="size-choice" value={s.id} checked={active} onChange={() => setSize(s.id)} className="sr-only" />
                  <span className="font-display text-lg font-medium md:text-xl">{s.label}</span>
                  <span className="mt-0.5 text-sm font-semibold tabular-nums">{usd(product.price + s.add)}</span>
                  <span className="mt-1 text-xs leading-snug text-ink-soft">{s.note}</span>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 inline-flex size-5 items-center justify-center rounded-full bg-ink text-paper">
                      <Check className="size-3" aria-hidden />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="eyebrow mb-4">{product.singleSize ? "1" : "2"} · Make it extra (optional)</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {addOns.map((a) => {
            const on = extras.includes(a.id);
            return (
              <label
                key={a.id}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-sm transition-colors ${
                  on ? "border-ink bg-card" : "border-line hover:border-ink/50"
                }`}
              >
                <input type="checkbox" checked={on} onChange={() => toggleExtra(a.id)} className="size-4 accent-[var(--color-poppy)]" />
                <span className="flex-1">{a.label}</span>
                <span className="font-semibold tabular-nums">+{usd(a.price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-4">{product.singleSize ? "2" : "3"} · Delivery</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Delivery date" name="deliveryDate" error={err("deliveryDate")} hint="Same-day if ordered by 1 PM recipient time">
            <input type="date" min={minDate} max={maxDate} className="field" required {...fieldProps("deliveryDate")} />
          </Field>
          <Field label="Delivering to a" name="locationType" error={err("locationType")}>
            <select className="field" defaultValue="Residence" {...fieldProps("locationType")}>
              {["Residence", "Business", "Funeral home", "Hospital", "Other"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Recipient's full name" name="recipientName" error={err("recipientName")}>
            <input className="field" autoComplete="off" required {...fieldProps("recipientName")} />
          </Field>
          <Field label="Recipient's phone" name="recipientPhone" error={err("recipientPhone")} hint="Only used to arrange delivery">
            <input type="tel" inputMode="tel" className="field" required {...fieldProps("recipientPhone")} />
          </Field>
          <Field label="Street address" name="address1" error={err("address1")} className="sm:col-span-2">
            <input className="field" autoComplete="off" required {...fieldProps("address1")} />
          </Field>
          <Field label="Apt, suite, floor (optional)" name="address2" error={err("address2")} className="sm:col-span-2">
            <input className="field" autoComplete="off" {...fieldProps("address2")} />
          </Field>
          <Field label="City" name="city" error={err("city")}>
            <input className="field" required {...fieldProps("city")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State" name="state" error={err("state")}>
              <select className="field" defaultValue="" required {...fieldProps("state")}>
                <option value="" disabled>
                  —
                </option>
                {US_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="ZIP" name="zip" error={err("zip")}>
              <input inputMode="numeric" className="field" maxLength={10} required {...fieldProps("zip")} />
            </Field>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-4">{product.singleSize ? "3" : "4"} · Card message</legend>
        <Field label="Handwritten card (optional)" name="cardMessage" error={err("cardMessage")} hint={`${card.length}/250 · Sign it the way you'd like it signed`}>
          <textarea
            rows={4}
            maxLength={250}
            className="field resize-y"
            value={card}
            {...fieldProps("cardMessage")}
            onChange={(e) => setCard(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-4">{product.singleSize ? "4" : "5"} · Your details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" name="senderName" error={err("senderName")}>
            <input className="field" autoComplete="name" required {...fieldProps("senderName")} />
          </Field>
          <Field label="Your phone" name="senderPhone" error={err("senderPhone")}>
            <input type="tel" inputMode="tel" autoComplete="tel" className="field" required {...fieldProps("senderPhone")} />
          </Field>
          <Field label="Your email" name="senderEmail" error={err("senderEmail")} className="sm:col-span-2" hint="Your confirmation and secure payment link go here">
            <input type="email" autoComplete="email" className="field" required {...fieldProps("senderEmail")} />
          </Field>
          <Field label="Notes for the florist (optional)" name="instructions" error={err("instructions")} className="sm:col-span-2" hint="Color preferences, gate codes, delivery timing…">
            <textarea rows={3} className="field resize-y" {...fieldProps("instructions")} />
          </Field>
        </div>
        <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      </fieldset>

      <div className="rounded-[1.5rem] bg-ink p-6 text-paper md:p-8">
        <dl className="space-y-2.5 text-sm">
          <Row label={`${product.name}${product.singleSize ? "" : ` · ${q.size.label}`}`} value={usd(q.item)} />
          {q.extras > 0 && <Row label="Extras" value={usd(q.extras)} />}
          <Row
            label="Delivery"
            value={q.delivery === 0 ? "Free" : usd(q.delivery)}
            note={q.delivery > 0 ? `Free over ${usd(FREE_DELIVERY_OVER)}` : undefined}
          />
          <div className="flex items-baseline justify-between border-t border-paper/20 pt-4">
            <dt className="eyebrow">Estimated total</dt>
            <dd className="font-display text-4xl font-medium tabular-nums" aria-live="polite">
              {usd(q.total)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-paper/60">Plus applicable sales tax. Nothing is charged until a florist confirms your order.</p>

        {status === "error" && serverMsg && (
          <p role="alert" className="mt-5 rounded-xl bg-poppy px-4 py-3 text-sm text-white">
            {serverMsg}
          </p>
        )}
        {Object.keys(errors).length > 0 && status !== "error" && (
          <p role="alert" className="mt-5 rounded-xl bg-poppy px-4 py-3 text-sm text-white">
            Please fix the {Object.keys(errors).length} highlighted {Object.keys(errors).length === 1 ? "field" : "fields"} above.
          </p>
        )}

        <button type="submit" className="btn btn-primary mt-6 w-full !min-h-14" disabled={status === "sending"}>
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending request…
            </>
          ) : (
            <>
              Request this order <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-paper/60">
          <Lock className="size-3.5" aria-hidden /> Secure payment link sent after confirmation
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="error-text">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-paper/80">
        {label}
        {note && <span className="ml-2 text-xs text-paper/50">({note})</span>}
      </dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
