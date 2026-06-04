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

export type GradFlowCloudData = {
  tasks: Task[];
  events: CalendarEvent[];
  internships: Internship[];
  goals: Goal[];
  notes: Note[];
  activityLogs: ActivityLog[];
  focusSessions: FocusSession[];
  dailyLogs: DailyLog[];
  assets: AssetItem[];

  ttuProfile: TtuProfile | null;
  ttuChapters: TtuChapter[];
  ttuRevisions: TtuRevision[];
  ttuGuidanceNotes: TtuGuidanceNote[];
  ttuDeadlines: TtuDeadline[];
};

export type GradFlowCloudRow = {
  user_id: string;
  data: GradFlowCloudData;
  updated_at: string;
};
