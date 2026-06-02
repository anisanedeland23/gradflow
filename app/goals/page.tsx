"use client";

import Sidebar from "@/components/Sidebar";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import AppButton from "@/components/AppButton";
import ModalCloseButton from "@/components/ModalCloseButton";
import EmptyState from "@/components/EmptyState";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { Goal } from "@/types/gradflow";
import { useEffect, useState } from "react";
import { addActivityLog } from "@/lib/activityLog";

export default function GoalsPage() {
  // ===============================
  // MAIN STATES
  // ===============================
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ===============================
  // MODAL STATE
  // ===============================
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===============================
  // FORM STATES
  // ===============================
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Academic");
  const [progress, setProgress] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [goalError, setGoalError] = useState("");

  // ===============================
  // EDIT & DELETE STATES
  // ===============================
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // ===============================
  // LOAD GOALS
  // ===============================
  useEffect(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEYS.goals);

    if (savedGoals) {
      const parsedGoals: Goal[] = JSON.parse(savedGoals);

      setGoals(parsedGoals);
    }

    setIsLoaded(true);
  }, []);

  // ===============================
  // SAVE GOALS
  // ===============================
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
  }, [goals, isLoaded]);

  // ===============================
  // FORM HELPERS
  // ===============================
  const resetForm = () => {
    setTitle("");
    setCategory("Academic");
    setProgress("");
    setTarget("");
    setDeadline("");
    setStatus("Not Started");
    setGoalError("");
    setEditingGoal(null);
  };

  const openAddModal = () => {
    resetForm();

    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);

    setTitle(goal.title);
    setCategory(goal.category);
    setProgress(String(goal.progress));
    setTarget(String(goal.target));
    setDeadline(goal.deadline);
    setStatus(goal.status);
    setGoalError("");

    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetForm();

    setIsModalOpen(false);
  };

  // ===============================
  // SAVE GOAL
  // ===============================
  const saveGoal = () => {
    if (title.trim() === "") {
      setGoalError("Goal title is required.");
      return;
    }

    if (progress.trim() === "") {
      setGoalError("Current progress is required.");
      return;
    }

    if (target.trim() === "") {
      setGoalError("Target is required.");
      return;
    }

    const progressNumber = Number(progress);
    const targetNumber = Number(target);

    if (Number.isNaN(progressNumber) || Number.isNaN(targetNumber)) {
      setGoalError("Progress and target must be valid numbers.");
      return;
    }

    if (targetNumber <= 0) {
      setGoalError("Target must be greater than 0.");
      return;
    }

    if (progressNumber < 0) {
      setGoalError("Progress cannot be negative.");
      return;
    }

    if (progressNumber > targetNumber) {
      setGoalError("Progress cannot be greater than target.");
      return;
    }

    if (editingGoal) {
      const updatedGoals = goals.map((goal) => {
        if (goal.id === editingGoal.id) {
          return {
            ...goal,
            title,
            category,
            progress: progressNumber,
            target: targetNumber,
            deadline,
            status,
          };
        }

        return goal;
      });

      setGoals(updatedGoals);
    } else {
      const newGoal: Goal = {
        id: Date.now(),
        title,
        category,
        progress: progressNumber,
        target: targetNumber,
        deadline,
        status,
        createdAt: Date.now(),
      };

      setGoals([...goals, newGoal]);

      addActivityLog({
        type: "goal_added",
        title: "Added goal",
        description: `${newGoal.title} • ${newGoal.category}`,
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // ===============================
  // DELETE GOAL
  // ===============================
  const deleteGoal = (id: number) => {
    const deletedGoal = goals.find((goal) => goal.id === id);

    const filteredGoals = goals.filter((goal) => goal.id !== id);

    setGoals(filteredGoals);

    if (deletedGoal) {
      addActivityLog({
        type: "goal_deleted",
        title: "Deleted goal",
        description: `${deletedGoal.title} • ${deletedGoal.category}`,
      });
    }

    setGoalToDelete(null);
  };

  // ===============================
  // GOAL PERCENTAGE
  // ===============================
  const getGoalPercentage = (progress: number, target: number) => {
    if (target === 0) return 0;

    const percentage = Math.round((progress / target) * 100);

    return Math.min(percentage, 100);
  };

  // ===============================
  // CATEGORY COLOR
  // ===============================
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Academic":
        return "bg-blue-100 text-blue-700";

      case "Career":
        return "bg-emerald-100 text-emerald-700";

      case "Project":
        return "bg-purple-100 text-purple-700";

      case "Skill":
        return "bg-orange-100 text-orange-700";

      case "Personal":
        return "bg-pink-100 text-pink-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ===============================
  // STATUS COLOR
  // ===============================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-slate-100 text-slate-700";

      case "In Progress":
        return "bg-yellow-100 text-yellow-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Paused":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ===============================
  // SORT GOALS
  // ===============================
  // Completed goal turun ke bawah, goal lain berdasarkan data terbaru.
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.status === "Completed" && b.status !== "Completed") {
      return 1;
    }

    if (a.status !== "Completed" && b.status === "Completed") {
      return -1;
    }

    return b.createdAt - a.createdAt;
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />

        <section className="flex-1 p-3 sm:p-4 lg:p-5">
          {/* PAGE HEADER */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-800">Goals</h1>

            <p className="mt-2 text-slate-500">
              Track your academic, career, project, and personal goals.
            </p>

            {/* ACTION BAR */}
            <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Goals Manager
                </h2>

                <p className="text-sm text-slate-500">
                  Create goals and monitor your progress.
                </p>
              </div>

              <AppButton variant="primary" size="lg" onClick={openAddModal}>
                + Add Goal
              </AppButton>
            </div>
          </div>

          {/* GOALS LIST */}
          <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Goal List</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your active goals will appear here.
                </p>
              </div>

              <div className="w-fit rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                {goals.length} Goals
              </div>
            </div>

            {/* EMPTY STATE */}
            {goals.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  title="No goals yet."
                  description="Create your first goal and track your progress."
                />
              </div>
            )}

            {/* GOAL ITEMS */}
            <div className="mt-6 grid gap-4">
              {sortedGoals.map((goal) => {
                const percentage = getGoalPercentage(
                  goal.progress,
                  goal.target,
                );

                return (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {goal.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-xl px-3 py-2 text-xs font-semibold ${getCategoryColor(
                              goal.category,
                            )}`}
                          >
                            {goal.category}
                          </span>

                          <span
                            className={`rounded-xl px-3 py-2 text-xs font-semibold ${getStatusColor(
                              goal.status,
                            )}`}
                          >
                            {goal.status}
                          </span>

                          {goal.deadline && (
                            <span className="text-xs text-slate-500">
                              Deadline: {goal.deadline}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-semibold text-slate-800">
                            {goal.progress}/{goal.target}
                          </p>

                          <p className="text-xs text-slate-500">
                            {percentage}% completed
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <AppButton
                            variant="warning"
                            size="icon"
                            onClick={() => openEditModal(goal)}
                          >
                            ✏️
                          </AppButton>

                          <AppButton
                            variant="danger"
                            size="icon"
                            onClick={() => setGoalToDelete(goal)}
                          >
                            🗑
                          </AppButton>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.status === "Completed"
                            ? "bg-green-600"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ADD / EDIT GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="my-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingGoal ? "Edit Goal" : "Add Goal"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define your target and track the progress
                </p>
              </div>

              <ModalCloseButton onClick={closeModal} />
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Goal Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Apply 10 internships"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Academic">Academic</option>
                  <option value="Career">Career</option>
                  <option value="Project">Project</option>
                  <option value="Skill">Skill</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Current Progress
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Example: 4"
                  value={progress}
                  onChange={(event) => setProgress(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Target
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Example: 10"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              {goalError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {goalError}
                </p>
              )}

              <AppButton
                variant="primary"
                size="lg"
                onClick={saveGoal}
                className="mt-2"
              >
                {editingGoal ? "Save Changes" : "Save Goal"}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* DELETE GOAL MODAL */}
      <ConfirmDeleteModal
        isOpen={!!goalToDelete}
        title="Delete Goal?"
        description="This action will permanently remove this goal from your goals tracker."
        itemName={goalToDelete?.title}
        itemDetail={
          goalToDelete
            ? `${goalToDelete.category} • ${goalToDelete.status}`
            : undefined
        }
        onCancel={() => setGoalToDelete(null)}
        onConfirm={() => {
          if (goalToDelete) {
            deleteGoal(goalToDelete.id);
          }
        }}
      />
    </main>
  );
}
