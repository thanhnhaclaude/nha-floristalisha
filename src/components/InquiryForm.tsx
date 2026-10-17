"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { fieldErrors, inquirySchema } from "@/lib/schemas";

type Errors = Record<string, string>;

export default function InquiryForm({ kind, dark = false }: { kind: "event" | "contact"; dark?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [ref, setRef] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), kind };
    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setMsg(data.message || "Something went wrong. Please email us directly.");
        setStatus("error");
        return;
      }
      setRef(data.id);
      setStatus("sent");
    } catch {
      setMsg("We couldn't reach the server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className={`rounded-[1.5rem] p-8 md:p-10 ${dark ? "bg-paper text-ink" : "bg-card border border-line"}`}>
        <CheckCircle2 className="size-10 text-success" aria-hidden strokeWidth={1.5} />
        <h3 className="mt-5 text-4xl font-medium">
          Thank you — <em>we&rsquo;re on it.</em>
        </h3>
        <p className="mt-4 text-ink-soft">
          {kind === "event"
            ? "Our events team will reply with ideas and a custom proposal within two business days."
            : "We'll reply within one business day. For same-day orders, please call us."}{" "}
          A confirmation is on its way to your inbox.
        </p>
        <p className="mt-4 text-sm">
          Reference: <span className="font-mono font-semibold">{ref}</span>
        </p>
      </div>
    );
  }

  const fp = (n: string) => ({
    id: `${kind}-${n}`,
    name: n,
    "aria-invalid": errors[n] ? true : undefined,
    "aria-describedby": errors[n] ? `${kind}-${n}-error` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field kind={kind} dark={dark} errors={errors} n="name" label="Your name">
        <input className="field" autoComplete="name" {...fp("name")} />
      </Field>
      <Field kind={kind} dark={dark} errors={errors} n="email" label="Email">
        <input type="email" className="field" autoComplete="email" {...fp("email")} />
      </Field>
      <Field kind={kind} dark={dark} errors={errors} n="phone" label="Phone (optional)">
        <input type="tel" className="field" autoComplete="tel" {...fp("phone")} />
      </Field>

      {kind === "event" ? (
        <>
          <Field kind={kind} dark={dark} errors={errors} n="eventType" label="Type of event">
            <select className="field" defaultValue="Wedding" {...fp("eventType")}>
              {["Wedding", "Elopement", "Corporate event", "Weekly office / lobby flowers", "Private party", "Funeral or memorial", "Other"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field kind={kind} dark={dark} errors={errors} n="eventDate" label="Event date">
            <input type="date" className="field" {...fp("eventDate")} />
          </Field>
          <Field kind={kind} dark={dark} errors={errors} n="guests" label="Guest count">
            <input inputMode="numeric" className="field" placeholder="e.g. 120" {...fp("guests")} />
          </Field>
          <Field kind={kind} dark={dark} errors={errors} n="venue" label="Venue or city" className="sm:col-span-2">
            <input className="field" placeholder="Venue name, city, state" {...fp("venue")} />
          </Field>
          <Field kind={kind} dark={dark} errors={errors} n="budget" label="Floral budget" className="sm:col-span-2">
            <select className="field" defaultValue="" {...fp("budget")}>
              <option value="">Not sure yet</option>
              {["Under $1,500", "$1,500 – $3,000", "$3,000 – $6,000", "$6,000 – $12,000", "$12,000+"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
        </>
      ) : (
        <Field kind={kind} dark={dark} errors={errors} n="subject" label="Subject">
          <select className="field" defaultValue="Question about an order" {...fp("subject")}>
            {["Question about an order", "Same-day delivery", "Corporate account", "Press & partnerships", "Something else"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      )}

      <Field kind={kind} dark={dark} errors={errors} n="message" label={kind === "event" ? "Tell us about your vision" : "Message"} className="sm:col-span-2">
        <textarea
          rows={5}
          className="field resize-y"
          placeholder={kind === "event" ? "Colors, mood, must-have flowers, Pinterest links…" : "How can we help?"}
          {...fp("message")}
        />
      </Field>

      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${kind}-company`}>Company</label>
        <input id={`${kind}-company`} name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-xl bg-poppy px-4 py-3 text-sm text-white sm:col-span-2">
          {msg}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" className={`btn ${dark ? "bg-paper text-ink hover:bg-blush" : "btn-primary"}`} disabled={status === "sending"}>
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              {kind === "event" ? "Request a proposal" : "Send message"} <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  n,
  label,
  children,
  className = "",
  kind,
  dark,
  errors,
}: {
  n: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  kind: string;
  dark: boolean;
  errors: Errors;
}) {
  const error = errors[n];
  return (
    <div className={className}>
      <label htmlFor={`${kind}-${n}`} className={`label ${dark ? "text-paper" : ""}`}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${kind}-${n}-error`} className={`error-text ${dark ? "!text-blush" : ""}`}>
          {error}
        </p>
      )}
    </div>
  );
}
