"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkle, ArrowRight, Warning, UserCircle } from "@phosphor-icons/react";

export interface DemoOrganizer {
  email: string;
  name: string;
}

export function LoginForm({ demoOrganizers }: { demoOrganizers: DemoOrganizer[] }) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  function quickFill(value: string) {
    setEmail(value);
    setError("");
    // Email is chosen — let the user go straight to typing the password.
    passwordRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      const from = searchParams.get("from");
      // Volunteers are always routed to their own area; organizers can deep-link back.
      const target = data.role === "organizer" ? from || data.redirect : data.redirect;
      // Hard navigation (not router.replace): forces a fresh server request that
      // carries the new session cookie and re-runs the proxy. A soft navigation
      // would reuse the router's cached pre-login redirect and bounce to /login.
      window.location.assign(target);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-700">
            <Sparkle size={26} weight="fill" className="text-sky-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Helm Events</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Sign in to your operations console
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-8 shadow-2xl backdrop-blur"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Password
            </label>
            <input
              id="password"
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300">
              <Warning size={16} weight="bold" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={16} weight="bold" />}
          </button>

          {demoOrganizers.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                Quick sign-in as organizer
              </p>
              <div className="space-y-2">
                {demoOrganizers.map((org) => (
                  <button
                    key={org.email}
                    type="button"
                    onClick={() => quickFill(org.email)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-2.5 text-left transition hover:border-sky-500/60 hover:bg-slate-900"
                  >
                    <UserCircle size={20} weight="duotone" className="shrink-0 text-sky-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-200">{org.name}</span>
                      <span className="block truncate text-[11px] font-medium text-slate-500">{org.email}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs font-medium text-slate-500">
            Pick an organizer above, then enter the password.
          </p>
        </form>
      </div>
    </div>
  );
}
