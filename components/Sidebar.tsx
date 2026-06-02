"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  // isOpen dipakai untuk membuka/menutup sidebar versi mobile.
  const [isOpen, setIsOpen] = useState(false);

  // pathname dipakai untuk mengetahui halaman aktif.
  // Contoh: kalau sedang di /calendar, menu Calendar akan diberi warna aktif.
  const pathname = usePathname();

  // Daftar menu sidebar.
  // Setiap item punya name untuk label dan path untuk route tujuan.
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
    },
    {
      name: "TTU / Skripsi",
      path: "/ttu",
    },
    {
      name: "Magang",
      path: "/magang",
    },
    {
      name: "Calendar",
      path: "/calendar",
    },
    {
      name: "Daily Log",
      path: "/daily-log",
    },
    {
      name: "Goals",
      path: "/goals",
    },
    {
      name: "Assets",
      path: "/assets",
    },
  ];

  return (
    <>
      {/* ===============================
          MOBILE NAVBAR
          =============================== */}
      <div className="flex items-center justify-between bg-slate-950 px-4 py-4 text-white lg:hidden">
        {/* LOGO */}
        <div>
          <h1 className="text-2xl font-bold text-blue-500">GradFlow</h1>

          <p className="text-xs text-slate-400">Productivity Dashboard</p>
        </div>

        {/* HAMBURGER BUTTON */}
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-slate-800 px-4 py-2 text-xl transition hover:bg-slate-700"
        >
          ☰
        </button>
      </div>

      {/* ===============================
          MOBILE SIDEBAR OVERLAY
          =============================== */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* CLICK OUTSIDE TO CLOSE */}
        <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

        {/* MOBILE SIDEBAR PANEL */}
        <aside
          className={`relative h-full w-72 transform bg-slate-950 p-6 text-white transition-all duration-500 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* TOP */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-500">GradFlow</h1>

              <p className="mt-1 text-sm text-slate-400">
                Productivity Dashboard
              </p>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-lg transition hover:bg-slate-700"
            >
              ✕
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="mt-10 flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                href={item.path}
                key={item.name}
                onClick={() => setIsOpen(false)}
                className={`rounded-2xl px-4 py-4 text-left font-medium transition-all duration-200 hover:scale-[1.02] ${
                  pathname === item.path
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      {/* ===============================
          DESKTOP SIDEBAR
          =============================== */}
      <aside className="hidden h-screen w-72 shrink-0 bg-slate-950 p-6 text-white lg:sticky lg:top-0 lg:flex lg:flex-col">
        {/* LOGO */}
        <div>
          <h1 className="text-4xl font-bold text-blue-500">GradFlow</h1>

          <p className="mt-2 text-sm text-slate-400">
            Academic & Career Dashboard
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-10 flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              href={item.path}
              key={item.name}
              className={`rounded-2xl px-4 py-4 text-left font-medium transition-all duration-200 hover:scale-[1.02] ${
                pathname === item.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* QUICK NOTE */}
        <div className="mt-12 rounded-3xl bg-slate-900 p-5 transition hover:bg-slate-800">
          <h2 className="text-lg font-semibold">Quick Note</h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Discipline today builds freedom tomorrow.
          </p>
        </div>
      </aside>
    </>
  );
}
