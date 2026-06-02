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
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Stats</h2>

      <p className="mt-1 text-gray-500">Productivity insights</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatsCard
          title="Tasks"
          value={String(totalTasks)}
          description={`${completedTasks} done • ${overdueTasks} overdue`}
        />

        <StatsCard
          title="Internship"
          value={String(totalInternships)}
          description={`${activeInternships} active • ${acceptedInternships} accepted`}
        />

        <StatsCard
          title="Streak"
          value={String(streak)}
          description="Days consistency"
        />

        <StatsCard
          title="Goals"
          value={`${averageGoalProgress}%`}
          description={`${activeGoals} active • ${completedGoals} done`}
        />
      </div>
    </div>
  );
}
