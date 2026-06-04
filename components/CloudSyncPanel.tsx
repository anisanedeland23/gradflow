"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  CLOUD_SYNC_STATUS_EVENT,
  type CloudSyncStatus,
  type CloudSyncStatusDetail,
} from "@/lib/cloudSyncEvents";

export default function CloudSyncPanel() {
  const [email, setEmail] = useState("");
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>("checking");
  const [syncMessage, setSyncMessage] = useState("Checking cloud sync...");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    };

    loadUser();

    const handleStatus = (event: Event) => {
      const customEvent = event as CustomEvent<CloudSyncStatusDetail>;

      setSyncStatus(customEvent.detail.status);
      setSyncMessage(customEvent.detail.message);
    };

    window.addEventListener(CLOUD_SYNC_STATUS_EVENT, handleStatus);

    return () => {
      window.removeEventListener(CLOUD_SYNC_STATUS_EVENT, handleStatus);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  const getStatusStyle = () => {
    switch (syncStatus) {
      case "checking":
        return {
          label: "Checking",
          background: "rgba(148, 163, 184, 0.16)",
          color: "#cbd5e1",
          dot: "#94a3b8",
        };

      case "ready":
        return {
          label: "Ready",
          background: "rgba(59, 130, 246, 0.16)",
          color: "#bfdbfe",
          dot: "#60a5fa",
        };

      case "saving":
        return {
          label: "Saving",
          background: "rgba(251, 191, 36, 0.16)",
          color: "#fde68a",
          dot: "#fbbf24",
        };

      case "synced":
        return {
          label: "Synced",
          background: "rgba(34, 197, 94, 0.16)",
          color: "#bbf7d0",
          dot: "#22c55e",
        };

      case "offline":
        return {
          label: "Offline",
          background: "rgba(251, 191, 36, 0.16)",
          color: "#fde68a",
          dot: "#fbbf24",
        };

      case "error":
      default:
        return {
          label: "Sync issue",
          background: "rgba(248, 113, 113, 0.16)",
          color: "#fecaca",
          dot: "#f87171",
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Signed in as</p>

          <p className="mt-1 truncate text-sm font-semibold text-white">
            {email || "GradFlow user"}
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold"
          style={{
            background: statusStyle.background,
            color: statusStyle.color,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: statusStyle.dot,
            }}
          />

          {statusStyle.label}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {syncMessage}
      </p>

      <button
        type="button"
        onClick={signOut}
        className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
      >
        Sign Out
      </button>
    </div>
  );
}
