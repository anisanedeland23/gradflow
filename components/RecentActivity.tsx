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

type ActivityTone = "sky" | "lavender" | "mint" | "peach" | "rose" | "neutral";

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
  // ACTIVITY TONE
  // ===============================
  const getActivityTone = (type: ActivityLog["type"]): ActivityTone => {
    if (type.includes("task")) {
      return "sky";
    }

    if (type.includes("event")) {
      return "lavender";
    }

    if (type.includes("internship")) {
      return "mint";
    }

    if (type.includes("goal")) {
      return "peach";
    }

    if (type.includes("note")) {
      return "rose";
    }

    return "neutral";
  };

  const toneStyles: Record<
    ActivityTone,
    {
      background: string;
      color: string;
      icon: string;
    }
  > = {
    sky: {
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
      icon: "✓",
    },
    lavender: {
      background: "var(--gf-lavender)",
      color: "var(--gf-primary)",
      icon: "▣",
    },
    mint: {
      background: "var(--gf-mint)",
      color: "var(--gf-success)",
      icon: "◇",
    },
    peach: {
      background: "var(--gf-peach)",
      color: "var(--gf-warning)",
      icon: "◎",
    },
    rose: {
      background: "var(--gf-rose)",
      color: "var(--gf-danger)",
      icon: "✦",
    },
    neutral: {
      background: "var(--gf-surface)",
      color: "var(--gf-muted)",
      icon: "•",
    },
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
    <section className="gf-card p-5">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Recent Activity
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            Latest GradFlow actions
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            A small timeline of your newest updates across the workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex h-11 min-w-11 items-center justify-center rounded-2xl px-3 text-sm font-bold"
            style={{
              background: "var(--gf-surface)",
              color: "var(--gf-muted)",
            }}
          >
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
          {recentLogs.map((log) => {
            const tone = toneStyles[getActivityTone(log.type)];

            return (
              <div
                key={log.id}
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
                style={{
                  background: "var(--gf-card-soft)",
                  borderColor: "var(--gf-border)",
                  boxShadow: "var(--gf-shadow-sm)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
                    style={{
                      background: tone.background,
                      color: tone.color,
                    }}
                  >
                    {tone.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3
                          className="text-sm font-semibold"
                          style={{
                            color: "var(--gf-ink)",
                          }}
                        >
                          {log.title}
                        </h3>

                        {log.description && (
                          <p
                            className="mt-1 text-xs leading-relaxed"
                            style={{
                              color: "var(--gf-muted)",
                            }}
                          >
                            {log.description}
                          </p>
                        )}

                        <p
                          className="mt-2 text-[11px]"
                          style={{
                            color: "var(--gf-muted)",
                          }}
                        >
                          {log.date} • {formatTime(log.createdAt)}
                        </p>
                      </div>

                      <span
                        className="gf-badge w-fit shrink-0 capitalize"
                        style={{
                          background: tone.background,
                          color: tone.color,
                        }}
                      >
                        {log.type.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
