"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).message || "Login failed.");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-[1.5rem] bg-paper p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-medium">Studio admin</h1>
        {!configured && (
          <p className="mt-4 rounded-xl bg-blush/60 p-3 text-sm">
            Admin is not configured yet. Set <code>ADMIN_PASSWORD</code> and <code>AUTH_SECRET</code> environment variables.
          </p>
        )}
        <label htmlFor="password" className="label mt-6">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" aria-invalid={error ? true : undefined} aria-describedby={error ? "pw-error" : undefined} />
        {error && (
          <p id="pw-error" role="alert" className="error-text">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-ink mt-6 w-full" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Sign in
        </button>
      </form>
    </div>
  );
}
