"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const generalNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "□",
  },
  {
    label: "TTU / Skripsi",
    href: "/ttu",
    icon: "✎",
  },
  {
    label: "Magang",
    href: "/magang",
    icon: "◇",
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: "▣",
  },
  {
    label: "Daily Log",
    href: "/daily-log",
    icon: "✦",
  },
];

const personalNavItems: NavItem[] = [
  {
    label: "Goals",
    href: "/goals",
    icon: "◎",
  },
  {
    label: "Assets",
    href: "/assets",
    icon: "⌘",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = isActivePath(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeMobileSidebar}
        className={`group relative flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition ${
          isActive
            ? "bg-white/[0.10] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 h-7 w-1 rounded-r-full bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.75)]" />
        )}

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm transition ${
            isActive
              ? "border-violet-300/50 bg-violet-400 text-slate-950 shadow-[0_0_18px_rgba(167,139,250,0.40)]"
              : "border-white/10 bg-white/[0.05] text-slate-400 group-hover:border-white/20 group-hover:text-white"
          }`}
        >
          {item.icon}
        </span>

        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--gf-border)] bg-[var(--gf-card)] text-[var(--gf-ink)] shadow-lg lg:hidden"
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <button
          type="button"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto border-r border-white/10 px-4 py-5 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "radial-gradient(circle at top left, rgba(124, 58, 237, 0.20), transparent 34%), linear-gradient(180deg, #050816 0%, #070817 45%, #03040b 100%)",
        }}
      >
        {/* TOP LOGO */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-lg font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              G
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                GradFlow
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">Academic cockpit</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm text-white lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-8 flex flex-1 flex-col gap-8">
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              General
            </p>

            <div className="mt-3 flex flex-col gap-1.5">
              {generalNavItems.map(renderNavItem)}
            </div>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Personal
            </p>

            <div className="mt-3 flex flex-col gap-1.5">
              {personalNavItems.map(renderNavItem)}
            </div>
          </div>
        </nav>

        {/* FOCUS FLIGHT MINI INFO */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400 text-slate-950 shadow-[0_0_18px_rgba(167,139,250,0.45)]">
              ✈
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Focus Flight</p>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Keep your study journey steady, one focused session at a time.
              </p>
            </div>
          </div>
        </div>

        {/* THEME TOGGLE */}
        <div className="mt-4">
          <ThemeToggle />
        </div>

        {/* FOOTER */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-xs text-slate-500">Signed in as</p>

          <p className="mt-1 truncate text-sm font-semibold text-white">
            Anisa
          </p>
        </div>
      </aside>
    </>
  );
}
