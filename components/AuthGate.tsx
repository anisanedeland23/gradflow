"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && !isLoginPage) {
        router.push("/login");
        setIsChecking(false);
        return;
      }

      if (session && isLoginPage) {
        router.push("/");
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.push("/login");
      }

      if (session && isLoginPage) {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-xl">
            G
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Loading GradFlow
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Preparing your academic cockpit...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
