"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppButton from "@/components/AppButton";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authMessage, setAuthMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignIn = authMode === "signin";

  const handleAuth = async () => {
    setAuthMessage("");

    if (email.trim() === "") {
      setAuthMessage("Email is required.");
      return;
    }

    if (password.trim() === "") {
      setAuthMessage("Password is required.");
      return;
    }

    if (password.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        router.push("/");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setAuthMessage(
        "Account created. Please check your email if confirmation is required, then sign in.",
      );

      setAuthMode("signin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl lg:grid-cols-2">
          {/* LEFT BRAND PANEL */}
          <section
            className="hidden min-h-[620px] p-10 lg:flex lg:flex-col lg:justify-between"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(124, 58, 237, 0.35), transparent 34%), linear-gradient(180deg, #050816 0%, #070817 45%, #03040b 100%)",
            }}
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-bold">
                  G
                </div>

                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    GradFlow
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    Academic cockpit
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
                  Focus Flight
                </p>

                <h2 className="mt-5 max-w-md text-5xl font-semibold leading-tight tracking-tight">
                  Sync your study flow across devices.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                  Manage tasks, skripsi progress, internship applications,
                  assets, goals, and focus sessions from one calm workspace.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm font-semibold text-white">
                “Small progress every day still matters.”
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Sign in to keep your GradFlow data available across devices.
              </p>
            </div>
          </section>

          {/* RIGHT AUTH FORM */}
          <section className="bg-white p-6 text-slate-950 sm:p-10">
            <div className="mx-auto flex min-h-[560px] max-w-md flex-col justify-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Welcome to GradFlow
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  {isSignIn ? "Sign in to your workspace" : "Create account"}
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {isSignIn
                    ? "Continue your academic productivity flow from any device."
                    : "Create your GradFlow account to start cloud sync."}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setAuthMessage("");
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setAuthMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleAuth();
                      }
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                  />
                </div>

                {authMessage && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      background: authMessage.includes("created")
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: authMessage.includes("created")
                        ? "#15803d"
                        : "#dc2626",
                    }}
                  >
                    {authMessage}
                  </p>
                )}

                <AppButton
                  variant="primary"
                  size="lg"
                  onClick={handleAuth}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Processing..."
                    : isSignIn
                      ? "Sign In"
                      : "Create Account"}
                </AppButton>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">
                  {isSignIn
                    ? "Don't have an account yet?"
                    : "Already have an account?"}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(isSignIn ? "signup" : "signin");
                    setAuthMessage("");
                  }}
                  className="mt-2 text-sm font-semibold text-violet-600"
                >
                  {isSignIn ? "Create new account" : "Sign in instead"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
