"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getLocalGradFlowData,
  saveGradFlowDataToCloud,
  syncCloudToLocal,
} from "@/lib/cloudSync";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { notifyCloudSyncStatus } from "@/lib/cloudSyncEvents";

const ACTIVE_USER_KEY = "gradflow-active-user-id";
const CLOUD_LOADED_USER_KEY = "gradflow-cloud-loaded-user-id";
const LOCAL_STORAGE_SYNC_EVENT = "gradflow-local-storage-updated";

const SYNC_STORAGE_KEYS = Object.values(STORAGE_KEYS);

const clearGradFlowLocalData = () => {
  SYNC_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

export default function AutoCloudSync() {
  const [isReady, setIsReady] = useState(false);
  const uploadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===============================
  // INITIAL CLOUD DOWNLOAD
  // ===============================
  useEffect(() => {
    const initializeCloudSync = async () => {
      notifyCloudSyncStatus({
        status: "checking",
        message: "Checking cloud data...",
        updatedAt: Date.now(),
      });

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          notifyCloudSyncStatus({
            status: "error",
            message: "Not signed in.",
            updatedAt: Date.now(),
          });

          return;
        }

        const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
        const loadedUserId = sessionStorage.getItem(CLOUD_LOADED_USER_KEY);

        // Kalau user berubah, bersihkan data localStorage lama.
        // Ini mencegah akun baru melihat data test / data akun sebelumnya.
        if (activeUserId !== user.id) {
          clearGradFlowLocalData();

          localStorage.setItem(ACTIVE_USER_KEY, user.id);
          sessionStorage.removeItem(CLOUD_LOADED_USER_KEY);
        }

        // Cloud data cukup di-load sekali per browser session.
        if (loadedUserId === user.id) {
          setIsReady(true);

          notifyCloudSyncStatus({
            status: "ready",
            message: "Auto sync ready.",
            updatedAt: Date.now(),
          });

          return;
        }

        const cloudData = await syncCloudToLocal();

        sessionStorage.setItem(CLOUD_LOADED_USER_KEY, user.id);

        // Kalau cloud belum punya data, simpan kondisi local yang sekarang.
        // Karena user baru sudah dibersihkan localStorage-nya, ini akan menyimpan data kosong.
        if (!cloudData) {
          await saveGradFlowDataToCloud(getLocalGradFlowData());

          setIsReady(true);

          notifyCloudSyncStatus({
            status: "synced",
            message: "Cloud workspace initialized.",
            updatedAt: Date.now(),
          });

          return;
        }

        notifyCloudSyncStatus({
          status: "synced",
          message: "Cloud data loaded. Refreshing...",
          updatedAt: Date.now(),
        });

        window.setTimeout(() => {
          window.location.reload();
        }, 700);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load cloud data.";

        notifyCloudSyncStatus({
          status: "error",
          message,
          updatedAt: Date.now(),
        });

        setIsReady(true);
      }
    };

    initializeCloudSync();
  }, []);

  // ===============================
  // PATCH LOCALSTORAGE EVENTS
  // ===============================
  useEffect(() => {
    if (!isReady) {
      return;
    }

    const originalSetItem = window.localStorage.setItem;
    const originalRemoveItem = window.localStorage.removeItem;
    const originalClear = window.localStorage.clear;

    window.localStorage.setItem = function patchedSetItem(key, value) {
      originalSetItem.call(this, key, value);

      if (SYNC_STORAGE_KEYS.includes(key)) {
        window.dispatchEvent(new Event(LOCAL_STORAGE_SYNC_EVENT));
      }
    };

    window.localStorage.removeItem = function patchedRemoveItem(key) {
      originalRemoveItem.call(this, key);

      if (SYNC_STORAGE_KEYS.includes(key)) {
        window.dispatchEvent(new Event(LOCAL_STORAGE_SYNC_EVENT));
      }
    };

    window.localStorage.clear = function patchedClear() {
      originalClear.call(this);

      window.dispatchEvent(new Event(LOCAL_STORAGE_SYNC_EVENT));
    };

    return () => {
      window.localStorage.setItem = originalSetItem;
      window.localStorage.removeItem = originalRemoveItem;
      window.localStorage.clear = originalClear;
    };
  }, [isReady]);

  // ===============================
  // AUTO UPLOAD WITH DEBOUNCE
  // ===============================
  useEffect(() => {
    if (!isReady) {
      return;
    }

    const uploadChanges = () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }

      notifyCloudSyncStatus({
        status: "saving",
        message: "Saving changes...",
        updatedAt: Date.now(),
      });

      uploadTimeoutRef.current = setTimeout(async () => {
        try {
          await saveGradFlowDataToCloud(getLocalGradFlowData());

          notifyCloudSyncStatus({
            status: "synced",
            message: "All changes saved.",
            updatedAt: Date.now(),
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to save changes.";

          notifyCloudSyncStatus({
            status: "error",
            message,
            updatedAt: Date.now(),
          });
        }
      }, 1500);
    };

    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, uploadChanges);

    return () => {
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, uploadChanges);

      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, [isReady]);

  return null;
}
