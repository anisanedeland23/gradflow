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
  // CATEGORY STYLE
  // ===============================
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Academic":
        return {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        };

      case "Career":
        return {
          background: "var(--gf-mint)",
          color: "var(--gf-success)",
        };

      case "Project":
        return {
          background: "var(--gf-lavender)",
          color: "var(--gf-primary)",
        };

      case "Skill":
        return {
          background: "var(--gf-peach)",
          color: "var(--gf-warning)",
        };

      case "Personal":
        return {
          background: "var(--gf-rose)",
          color: "var(--gf-danger)",
        };

      default:
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };
    }
  };

  // ===============================
  // STATUS STYLE
  // ===============================
  const getStatusStyle = (goalStatus: string) => {
    switch (goalStatus) {
      case "Not Started":
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };

      case "In Progress":
        return {
          background: "var(--gf-yellow-soft)",
          color: "var(--gf-warning)",
        };

      case "Completed":
        return {
          background: "var(--gf-success-soft)",
          color: "var(--gf-success)",
        };

      case "Paused":
        return {
          background: "var(--gf-danger-soft)",
          color: "var(--gf-danger)",
        };

      default:
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };
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
    <main className="gf-page">
      <Sidebar />

      <section className="min-h-screen p-3 pt-20 sm:p-4 sm:pt-20 lg:ml-72 lg:p-5">
        {/* PAGE HEADER */}
        <div className="gf-panel p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Goals
              </p>

              <h1
                className="mt-2 text-3xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Goal system
              </h1>

              <p
                className="mt-2 text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Track your academic, career, project, skill, and personal
                progress in one place.
              </p>
            </div>

            <div
              className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
              style={{
                background: "var(--gf-lavender)",
                color: "var(--gf-primary)",
              }}
            >
              Long-term Target
            </div>
          </div>

          {/* ACTION BAR */}
          <div
            className="mt-6 flex flex-col gap-4 rounded-3xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: "var(--gf-card-soft)",
              borderColor: "var(--gf-border)",
            }}
          >
            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Goals Manager
              </h2>

              <p
                className="text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Create goals and monitor your progress.
              </p>
            </div>

            <AppButton variant="primary" size="lg" onClick={openAddModal}>
              + Add Goal
            </AppButton>
          </div>
        </div>

        {/* GOALS LIST */}
        <div className="gf-card mt-4 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Goal List
              </p>

              <h2
                className="mt-2 text-xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Active direction
              </h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Your goals will appear here.
              </p>
            </div>

            <div
              className="w-fit rounded-xl px-3 py-2 text-sm font-medium"
              style={{
                background: "var(--gf-surface)",
                color: "var(--gf-muted)",
              }}
            >
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
              const percentage = getGoalPercentage(goal.progress, goal.target);

              const categoryStyle = getCategoryStyle(goal.category);
              const statusStyle = getStatusStyle(goal.status);

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border p-5 transition hover:-translate-y-0.5"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                    boxShadow: "var(--gf-shadow-sm)",
                  }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3
                        className="font-semibold"
                        style={{
                          color: "var(--gf-ink)",
                        }}
                      >
                        {goal.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className="gf-badge"
                          style={{
                            background: categoryStyle.background,
                            color: categoryStyle.color,
                          }}
                        >
                          {goal.category}
                        </span>

                        <span
                          className="gf-badge"
                          style={{
                            background: statusStyle.background,
                            color: statusStyle.color,
                          }}
                        >
                          {goal.status}
                        </span>

                        {goal.deadline && (
                          <span
                            className="text-xs"
                            style={{
                              color: "var(--gf-muted)",
                            }}
                          >
                            Deadline: {goal.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                      <div className="text-left sm:text-right">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: "var(--gf-ink)",
                          }}
                        >
                          {goal.progress}/{goal.target}
                        </p>

                        <p
                          className="text-xs"
                          style={{
                            color: "var(--gf-muted)",
                          }}
                        >
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

                  <div
                    className="mt-4 h-3 overflow-hidden rounded-full"
                    style={{
                      background: "var(--gf-surface)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background:
                          goal.status === "Completed"
                            ? "var(--gf-success)"
                            : "var(--gf-primary)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ADD / EDIT GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div
            className="my-6 w-full max-w-md rounded-3xl border p-6 shadow-2xl"
            style={{
              background: "var(--gf-card)",
              borderColor: "var(--gf-border)",
              color: "var(--gf-ink)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  {editingGoal ? "Edit goal" : "New goal"}
                </p>

                <h2
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  {editingGoal ? "Edit Goal" : "Add Goal"}
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Define your target and track the progress.
                </p>
              </div>

              <ModalCloseButton onClick={closeModal} />
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Goal Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Apply 10 internships"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="gf-input mt-2"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="gf-input mt-2"
                >
                  <option value="Academic">Academic</option>
                  <option value="Career">Career</option>
                  <option value="Project">Project</option>
                  <option value="Skill">Skill</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Current Progress
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Example: 4"
                  value={progress}
                  onChange={(event) => setProgress(event.target.value)}
                  className="gf-input mt-2"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Target
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Example: 10"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="gf-input mt-2"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="gf-input mt-2"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="gf-input mt-2"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              {goalError && (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: "var(--gf-danger-soft)",
                    color: "var(--gf-danger)",
                  }}
                >
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
