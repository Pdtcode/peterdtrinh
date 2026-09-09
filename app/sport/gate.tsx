"use client";

import { useState, type FormEvent } from "react";

import { title, subtitle, container } from "@/components/primitives";

/**
 * Password form for /sport. Deliberately says nothing about what is behind it
 * and gives the same message for a wrong password as for an empty one.
 */
export default function SportGate() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("checking");
    setMessage("");

    try {
      const response = await fetch("/api/sport/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Full reload so the server component re-reads the new cookie.
        window.location.reload();

        return;
      }

      setStatus("error");
      setMessage(
        response.status === 429
          ? "Too many attempts. Try again in a few minutes."
          : "Incorrect password.",
      );
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  return (
    <section
      className={container({
        width: "narrow",
        class: "flex min-h-[70vh] items-center py-20",
      })}
    >
      <div className="w-full max-w-md">
        <p className="eyebrow">Restricted</p>
        <h1 className={title({ size: "md", class: "mt-5" })}>Sport</h1>
        <p className={subtitle({ size: "sm", class: "mt-4" })}>
          This page is private. Enter the password to continue.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              className="font-mono text-xs uppercase tracking-label text-muted"
              htmlFor="sport-password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition-colors focus:border-accent"
              id="sport-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
          </div>

          <button
            className="w-full rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
            disabled={status === "checking" || password.length === 0}
            type="submit"
          >
            {status === "checking" ? "Checking…" : "Unlock"}
          </button>

          {message ? (
            <p aria-live="polite" className="text-sm text-muted">
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
