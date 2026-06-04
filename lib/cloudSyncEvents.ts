export type CloudSyncStatus =
  | "checking"
  | "ready"
  | "saving"
  | "synced"
  | "error"
  | "offline";

export type CloudSyncStatusDetail = {
  status: CloudSyncStatus;
  message: string;
  updatedAt: number;
};

export const CLOUD_SYNC_STATUS_EVENT = "gradflow-cloud-sync-status";

export const notifyCloudSyncStatus = (detail: CloudSyncStatusDetail) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CloudSyncStatusDetail>(CLOUD_SYNC_STATUS_EVENT, {
      detail,
    }),
  );
};
