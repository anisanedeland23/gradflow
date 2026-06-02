"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import AppButton from "@/components/AppButton";
import type { ActivityLog } from "@/types/gradflow";
import {
  ACTIVITY_LOG_UPDATED_EVENT,
  getActivityLogs,
  clearActivityLogs,
} from "@/lib/activityLog";

export default function RecentActivity() {
  // ===============================
  // ACTIVITY LOG STATE
  // ===============================
  // logs menyimpan daftar aktivitas terbaru user.
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // ===============================
  // LOAD ACTIVITY LOGS
  // ===============================
  // Function ini membaca activity log terbaru dari localStorage
  // lalu memasukkannya ke state.
  const loadActivityLogs = () => {
    const latestLogs = getActivityLogs();

    setLogs(latestLogs);
  };

  // ===============================
  // AUTO REFRESH ACTIVITY LOGS
  // ===============================
  // Saat component pertama kali muncul:
  // 1. Load activity logs.
  // 2. Dengarkan custom event "activity-log-updated".
  // 3. Kalau event itu terjadi, reload activity logs.
  // 4. Saat component hilang, listener dibersihkan.
  useEffect(() => {
    loadActivityLogs();

    window.addEventListener(ACTIVITY_LOG_UPDATED_EVENT, loadActivityLogs);

    return () => {
      window.removeEventListener(ACTIVITY_LOG_UPDATED_EVENT, loadActivityLogs);
    };
  }, []);

  // ===============================
  // FORMAT TIME
  // ===============================
  // Mengubah timestamp createdAt menjadi format waktu singkat.
  // Contoh: 18.42
  const formatTime = (createdAt: number) => {
    return new Date(createdAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===============================
  // ACTIVITY COLOR
  // ===============================
  // Warna badge berdasarkan jenis aktivitas.
  const getActivityColor = (type: ActivityLog["type"]) => {
    if (type.includes("task")) {
      return "bg-blue-100 text-blue-700";
    }

    if (type.includes("event")) {
      return "bg-purple-100 text-purple-700";
    }

    if (type.includes("internship")) {
      return "bg-green-100 text-green-700";
    }

    if (type.includes("goal")) {
      return "bg-orange-100 text-orange-700";
    }

    if (type.includes("note")) {
      return "bg-pink-100 text-pink-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  // ===============================
  // RECENT LOGS
  // ===============================
  // Ambil 5 log terbaru saja supaya card dashboard tidak terlalu panjang.
  const recentLogs = logs.slice(0, 5);

  // ===============================
  // CLEAR LOGS
  // ===============================
  // Menghapus semua activity log setelah user memberi konfirmasi.
  const handleClearLogs = () => {
    const isConfirmed = window.confirm("Clear all activity logs?");

    if (!isConfirmed) {
      return;
    }

    clearActivityLogs();
  };

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest actions across GradFlow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            {logs.length}
          </div>

          {logs.length > 0 && (
            <AppButton variant="secondary" size="sm" onClick={handleClearLogs}>
              Clear
            </AppButton>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {recentLogs.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No activity yet."
            description="Your actions will appear here automatically."
            size="sm"
          />
        </div>
      )}

      {/* ACTIVITY LIST */}
      {recentLogs.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {log.title}
                  </h3>

                  {log.description && (
                    <p className="mt-1 text-xs text-slate-500">
                      {log.description}
                    </p>
                  )}

                  <p className="mt-2 text-[11px] text-slate-400">
                    {log.date} • {formatTime(log.createdAt)}
                  </p>
                </div>

                <span
                  className={`rounded-xl px-3 py-2 text-[10px] font-semibold ${getActivityColor(
                    log.type,
                  )}`}
                >
                  {log.type.replaceAll("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
