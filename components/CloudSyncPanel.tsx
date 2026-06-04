"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { syncCloudToLocal, syncLocalToCloud } from "@/lib/cloudSync";

export default function CloudSyncPanel() {
  const [email, setEmail] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    };

    loadUser();
  }, []);

  const uploadToCloud = async () => {
    setSyncMessage("");
    setIsSyncing(true);

    try {
      await syncLocalToCloud();

      setSyncMessage("Uploaded to cloud.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload data.";

      setSyncMessage(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadFromCloud = async () => {
    setSyncMessage("");
    setIsSyncing(true);

    try {
      const data = await syncCloudToLocal();

      if (!data) {
        setSyncMessage("No cloud data found yet. Upload this device first.");
        return;
      }

      setSyncMessage("Downloaded from cloud. Refreshing...");

      window.setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download data.";

      setSyncMessage(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-xs text-slate-500">Signed in as</p>

      <p className="mt-1 truncate text-sm font-semibold text-white">
        {email || "GradFlow user"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={uploadToCloud}
          disabled={isSyncing}
          className="rounded-xl bg-violet-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Upload
        </button>

        <button
          type="button"
          onClick={downloadFromCloud}
          disabled={isSyncing}
          className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download
        </button>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="mt-2 w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
      >
        Sign Out
      </button>

      {syncMessage && (
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          {syncMessage}
        </p>
      )}
    </div>
  );
}
