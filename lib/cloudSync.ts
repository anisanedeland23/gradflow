import { supabase } from "@/lib/supabaseClient";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { GradFlowCloudData, GradFlowCloudRow } from "@/types/cloudData";
import type {
  Task,
  Internship,
  Goal,
  Event as CalendarEvent,
  Note,
  ActivityLog,
  FocusSession,
  DailyLog,
  AssetItem,
  TtuProfile,
  TtuChapter,
  TtuRevision,
  TtuGuidanceNote,
  TtuDeadline,
} from "@/types/gradflow";

const safeParse = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallback;
  }

  try {
    return JSON.parse(savedValue) as T;
  } catch {
    return fallback;
  }
};

const safeSet = <T>(key: string, value: T) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalGradFlowData = (): GradFlowCloudData => {
  return {
    tasks: safeParse<Task[]>(STORAGE_KEYS.tasks, []),
    events: safeParse<CalendarEvent[]>(STORAGE_KEYS.events, []),
    internships: safeParse<Internship[]>(STORAGE_KEYS.internships, []),
    goals: safeParse<Goal[]>(STORAGE_KEYS.goals, []),
    notes: safeParse<Note[]>(STORAGE_KEYS.notes, []),
    activityLogs: safeParse<ActivityLog[]>(STORAGE_KEYS.activityLogs, []),
    focusSessions: safeParse<FocusSession[]>(STORAGE_KEYS.focusSessions, []),
    dailyLogs: safeParse<DailyLog[]>(STORAGE_KEYS.dailyLogs, []),
    assets: safeParse<AssetItem[]>(STORAGE_KEYS.assets, []),

    ttuProfile: safeParse<TtuProfile | null>(STORAGE_KEYS.ttuProfile, null),
    ttuChapters: safeParse<TtuChapter[]>(STORAGE_KEYS.ttuChapters, []),
    ttuRevisions: safeParse<TtuRevision[]>(STORAGE_KEYS.ttuRevisions, []),
    ttuGuidanceNotes: safeParse<TtuGuidanceNote[]>(
      STORAGE_KEYS.ttuGuidanceNotes,
      [],
    ),
    ttuDeadlines: safeParse<TtuDeadline[]>(STORAGE_KEYS.ttuDeadlines, []),
  };
};

export const saveGradFlowDataToLocal = (data: GradFlowCloudData) => {
  safeSet(STORAGE_KEYS.tasks, data.tasks);
  safeSet(STORAGE_KEYS.events, data.events);
  safeSet(STORAGE_KEYS.internships, data.internships);
  safeSet(STORAGE_KEYS.goals, data.goals);
  safeSet(STORAGE_KEYS.notes, data.notes);
  safeSet(STORAGE_KEYS.activityLogs, data.activityLogs);
  safeSet(STORAGE_KEYS.focusSessions, data.focusSessions);
  safeSet(STORAGE_KEYS.dailyLogs, data.dailyLogs);
  safeSet(STORAGE_KEYS.assets, data.assets);

  if (data.ttuProfile) {
    safeSet(STORAGE_KEYS.ttuProfile, data.ttuProfile);
  }

  safeSet(STORAGE_KEYS.ttuChapters, data.ttuChapters);
  safeSet(STORAGE_KEYS.ttuRevisions, data.ttuRevisions);
  safeSet(STORAGE_KEYS.ttuGuidanceNotes, data.ttuGuidanceNotes);
  safeSet(STORAGE_KEYS.ttuDeadlines, data.ttuDeadlines);
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};

export const getCloudGradFlowData = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("gradflow_user_data")
    .select("user_id, data, updated_at")
    .eq("user_id", user.id)
    .maybeSingle<GradFlowCloudRow>();

  if (error) {
    throw error;
  }

  return data;
};

export const saveGradFlowDataToCloud = async (
  data: GradFlowCloudData = getLocalGradFlowData(),
) => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in before saving to cloud.");
  }

  const { error } = await supabase.from("gradflow_user_data").upsert({
    user_id: user.id,
    data,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
};

export const syncLocalToCloud = async () => {
  const localData = getLocalGradFlowData();

  await saveGradFlowDataToCloud(localData);
};

export const syncCloudToLocal = async () => {
  const cloudRow = await getCloudGradFlowData();

  if (!cloudRow) {
    return null;
  }

  saveGradFlowDataToLocal(cloudRow.data);

  return cloudRow.data;
};
