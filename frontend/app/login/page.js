"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Loading from "@/components/shared/Loading";
import { useClientReady } from "@/hooks/useClientReady";
import { isAuthenticated, setToken, setUser } from "@/lib/auth";
import { loginRequest } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const ready = useClientReady();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const alreadyAuthenticated = ready && isAuthenticated();

  useEffect(() => {
    if (alreadyAuthenticated) {
      router.replace("/dashboard");
    }
  }, [alreadyAuthenticated, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const { token, user } = await loginRequest(trimmedEmail, password);
      setToken(token);
      setUser(user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
      setSubmitting(false);
    }
  }

  if (!ready || alreadyAuthenticated) {
    return <Loading message="Loading..." />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4Z" fill="currentColor" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Doctor Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Medical Administration Portal
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={email}
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </main>
  );
}
