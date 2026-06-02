import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { ActivityLog } from "@/types/gradflow";

// ===============================
// ACTIVITY LOG EVENT NAME
// ===============================
// Nama event custom yang dipakai untuk memberi tahu component lain
// bahwa activity log baru saja berubah.
export const ACTIVITY_LOG_UPDATED_EVENT = "activity-log-updated";

// ===============================
// GET TODAY DATE
// ===============================
// Menghasilkan tanggal hari ini dalam format YYYY-MM-DD.
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// ===============================
// GET ACTIVITY LOGS
// ===============================
// Mengambil semua activity log dari localStorage.
export const getActivityLogs = () => {
  const savedLogs = localStorage.getItem(STORAGE_KEYS.activityLogs);

  if (!savedLogs) {
    return [];
  }

  const parsedLogs: ActivityLog[] = JSON.parse(savedLogs);

  return parsedLogs;
};

// ===============================
// ADD ACTIVITY LOG
// ===============================
// Menambahkan activity log baru ke localStorage.
// Setelah data disimpan, function ini mengirim custom event
// supaya component seperti RecentActivity bisa auto-refresh.
export const addActivityLog = (
  log: Omit<ActivityLog, "id" | "date" | "createdAt">,
) => {
  const existingLogs = getActivityLogs();

  const newLog: ActivityLog = {
    id: Date.now(),
    date: getTodayDate(),
    createdAt: Date.now(),
    ...log,
  };

  const updatedLogs = [newLog, ...existingLogs];

  localStorage.setItem(STORAGE_KEYS.activityLogs, JSON.stringify(updatedLogs));

  // Kirim signal ke browser bahwa activity log berubah.
  window.dispatchEvent(new Event(ACTIVITY_LOG_UPDATED_EVENT));
};

// ===============================
// CLEAR ACTIVITY LOGS
// ===============================
// Menghapus semua activity log dari localStorage.
// Setelah dihapus, kirim signal supaya RecentActivity auto-refresh.
export const clearActivityLogs = () => {
  localStorage.removeItem(STORAGE_KEYS.activityLogs);

  window.dispatchEvent(new Event(ACTIVITY_LOG_UPDATED_EVENT));
};
