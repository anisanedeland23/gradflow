import StatsCard from "./StatsCard";
import type { Task, Internship, Goal } from "@/types/gradflow";

type StatsSectionProps = {
  tasks: Task[];
  streak: number;
  internships: Internship[];
  goals: Goal[];
};

export default function StatsSection({
  tasks,
  streak,
  internships,
  goals,
}: StatsSectionProps) {
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((task) => task.completed).length;

  const overdueTasks = tasks.filter((task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDeadline = new Date(`${task.deadline}T00:00:00`);

    return !task.completed && taskDeadline < today;
  }).length;

  const totalInternships = internships.length;

  const activeInternships = internships.filter(
    (internship) =>
      internship.status === "Wishlist" ||
      internship.status === "Applied" ||
      internship.status === "Interview",
  ).length;

  const acceptedInternships = internships.filter(
    (internship) => internship.status === "Accepted",
  ).length;

  const activeGoals = goals.filter(
    (goal) => goal.status !== "Completed",
  ).length;

  const completedGoals = goals.filter(
    (goal) => goal.status === "Completed",
  ).length;

  const totalGoalProgress = goals.reduce((total, goal) => {
    if (goal.target === 0) return total;

    const percentage = Math.min(
      Math.round((goal.progress / goal.target) * 100),
      100,
    );

    return total + percentage;
  }, 0);

  const averageGoalProgress =
    goals.length === 0 ? 0 : Math.round(totalGoalProgress / goals.length);

  return (
    <section className="gf-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Stats
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            Productivity insights
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            A quick snapshot of your academic flow.
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{
            background: "var(--gf-lavender)",
            color: "var(--gf-primary)",
          }}
        >
          ✨
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatsCard
          title="Tasks"
          value={String(totalTasks)}
          description={`${completedTasks} done • ${overdueTasks} overdue`}
          icon="✓"
          tone="sky"
        />

        <StatsCard
          title="Internship"
          value={String(totalInternships)}
          description={`${activeInternships} active • ${acceptedInternships} accepted`}
          icon="◇"
          tone="peach"
        />

        <StatsCard
          title="Streak"
          value={String(streak)}
          description="Days consistency"
          icon="🔥"
          tone="mint"
        />

        <StatsCard
          title="Goals"
          value={`${averageGoalProgress}%`}
          description={`${activeGoals} active • ${completedGoals} done`}
          icon="◎"
          tone="lavender"
        />
      </div>
    </section>
  );
}
