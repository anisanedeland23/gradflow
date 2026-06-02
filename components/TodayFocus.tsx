"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addActivityLog } from "@/lib/activityLog";
import type { Task } from "@/types/gradflow";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import AppButton from "@/components/AppButton";
import ModalCloseButton from "@/components/ModalCloseButton";
import EmptyState from "@/components/EmptyState";

// Props yang dikirim dari app/page.tsx ke komponen TodayFocus.
// TodayFocus menerima data task dari parent, bukan menyimpan source of truth sendiri.
type TodayFocusProps = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  completedTasks: number;
  updateStreak: () => void;
};

export default function TodayFocus({
  tasks,
  setTasks,
  completedTasks,
  updateStreak,
}: TodayFocusProps) {
  // ===============================
  // MODAL STATES
  // ===============================
  // Mengontrol modal Add Task.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Menyimpan task yang sedang diedit.
  // Kalau null, berarti tidak ada task yang sedang diedit.
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // taskToDelete menyimpan task yang sedang menunggu konfirmasi delete.
  // Kalau nilainya null, berarti delete modal tidak terbuka.
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // ===============================
  // UI STATE
  // ===============================
  // Kalau false, task yang tampil hanya 6.
  // Kalau true, semua task tampil.
  const [showAllTasks, setShowAllTasks] = useState(false);

  // ===============================
  // ADD TASK STATES
  // ===============================
  // Input untuk task baru.
  const [newTask, setNewTask] = useState("");

  // Input deadline untuk task baru.
  const [deadline, setDeadline] = useState("");

  // Pesan error khusus modal Add Task.
  const [addError, setAddError] = useState("");

  // ===============================
  // EDIT TASK STATES
  // ===============================
  // Input nama task saat sedang edit.
  const [editTaskName, setEditTaskName] = useState("");

  // Input deadline saat sedang edit.
  const [editDeadline, setEditDeadline] = useState("");

  // Pesan error khusus modal Edit Task.
  const [editError, setEditError] = useState("");

  // ===============================
  // TOGGLE TASK
  // ===============================
  // Mengubah status task dari belum selesai ke selesai, atau sebaliknya.
  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const updatedCompleted = !task.completed;

        // Streak hanya bertambah saat task berubah menjadi completed.
        if (updatedCompleted) {
          updateStreak();

          addActivityLog({
            type: "task_completed",
            title: "Completed task",
            description: task.text,
          });
        }

        return {
          ...task,
          completed: updatedCompleted,
        };
      }

      return task;
    });

    setTasks(updatedTasks);
  };

  // ===============================
  // ADD TASK
  // ===============================
  // Membuat task baru dari input Add Task Modal.
  const addTask = () => {
    if (newTask.trim() === "") {
      setAddError("Task name is required.");
      return;
    }

    if (deadline.trim() === "") {
      setAddError("Deadline is required.");
      return;
    }

    const newTaskObject: Task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      deadline,
      createdAt: Date.now(),
    };

    setTasks([...tasks, newTaskObject]);

    addActivityLog({
      type: "task_added",
      title: "Added task",
      description: newTaskObject.text,
    });

    // Reset form add.
    setNewTask("");
    setDeadline("");
    setAddError("");

    // Tutup modal add.
    setIsModalOpen(false);
  };

  // ===============================
  // OPEN EDIT MODAL
  // ===============================
  // Membuka modal edit dan mengisi input dengan data task lama.
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTaskName(task.text);
    setEditDeadline(task.deadline);
    setEditError("");
  };

  // ===============================
  // SAVE EDITED TASK
  // ===============================
  // Menyimpan perubahan dari Edit Task Modal.
  const saveEditedTask = () => {
    if (!editingTask) {
      return;
    }

    if (editTaskName.trim() === "") {
      setEditError("Task name is required.");
      return;
    }

    if (editDeadline.trim() === "") {
      setEditError("Deadline is required.");
      return;
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id === editingTask.id) {
        return {
          ...task,
          text: editTaskName,
          deadline: editDeadline,
        };
      }

      return task;
    });

    setTasks(updatedTasks);

    // Reset form edit.
    setEditingTask(null);
    setEditTaskName("");
    setEditDeadline("");
    setEditError("");
  };

  // ===============================
  // DELETE TASK
  // ===============================
  // Menghapus task berdasarkan id.
  const deleteTask = (id: number) => {
    const deletedTask = tasks.find((task) => task.id === id);

    const filteredTasks = tasks.filter((task) => task.id !== id);

    setTasks(filteredTasks);

    if (deletedTask) {
      addActivityLog({
        type: "task_deleted",
        title: "Deleted task",
        description: deletedTask.text,
      });
    }

    setTaskToDelete(null);
  };

  // ===============================
  // SORT TASKS
  // ===============================
  // Task diurutkan berdasarkan deadline terdekat.
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // ===============================
  // VISIBLE TASKS
  // ===============================
  // Kalau showAllTasks false, tampilkan 6 task pertama.
  const visibleTasks = showAllTasks ? sortedTasks : sortedTasks.slice(0, 6);

  const progressPercentage =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  return (
    <>
      {/* ===============================
          MAIN CARD
          =============================== */}
      <section className="gf-panel overflow-hidden p-5">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
                style={{
                  background: "var(--gf-primary-soft)",
                  color: "var(--gf-primary)",
                }}
              >
                ✦
              </span>

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Today Focus
                </p>

                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Plan your next productive steps
                </h2>
              </div>
            </div>

            <p
              className="mt-3 max-w-2xl text-sm"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Keep today&apos;s tasks visible, finish the important ones first,
              and let small progress compound.
            </p>
          </div>

          {/* ADD BUTTON */}
          <AppButton
            variant="primary"
            size="md"
            onClick={() => {
              setAddError("");
              setNewTask("");
              setDeadline("");
              setIsModalOpen(true);
            }}
          >
            + Add Task
          </AppButton>
        </div>

        {/* PROGRESS STRIP */}
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            background: "var(--gf-card-soft)",
            borderColor: "var(--gf-border)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                {completedTasks}/{tasks.length} tasks completed
              </p>

              <p
                className="mt-1 text-xs"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Finish your core academic actions for today.
              </p>
            </div>

            <span
              className="gf-badge"
              style={{
                background: "var(--gf-mint)",
                color: "var(--gf-success)",
              }}
            >
              {progressPercentage}% done
            </span>
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
                width: `${progressPercentage}%`,
                background: "var(--gf-primary)",
              }}
            />
          </div>
        </div>

        {/* TASK LIST */}
        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {/* EMPTY STATE */}
          {tasks.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="No tasks yet."
                description="Add your first task to start your focus day."
              />
            </div>
          )}

          {/* TASK ITEMS */}
          {visibleTasks.map((task) => {
            // Overdue jika task belum selesai dan deadline sudah lewat.
            const isOverdue =
              !task.completed &&
              new Date(`${task.deadline}T00:00:00`) <
                new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={task.id}
                className="group rounded-2xl border p-4 transition hover:-translate-y-0.5"
                style={{
                  background: task.completed
                    ? "var(--gf-card-soft)"
                    : isOverdue
                      ? "var(--gf-danger-soft)"
                      : "var(--gf-card)",
                  borderColor: isOverdue
                    ? "var(--gf-danger)"
                    : "var(--gf-border)",
                  boxShadow: "var(--gf-shadow-sm)",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* CHECKBOX */}
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition"
                    style={{
                      background: task.completed
                        ? "var(--gf-success)"
                        : "transparent",
                      borderColor: task.completed
                        ? "var(--gf-success)"
                        : "var(--gf-border-strong)",
                      color: task.completed ? "#ffffff" : "var(--gf-muted)",
                    }}
                    aria-label="Toggle task completion"
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  {/* TASK TEXT */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? "line-through" : ""
                      }`}
                      style={{
                        color: task.completed
                          ? "var(--gf-muted)"
                          : "var(--gf-ink)",
                      }}
                    >
                      {task.text}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className="gf-badge"
                        style={{
                          background: "var(--gf-sky)",
                          color: "var(--gf-link)",
                        }}
                      >
                        Deadline: {task.deadline}
                      </span>

                      {task.completed && (
                        <span
                          className="gf-badge"
                          style={{
                            background: "var(--gf-success-soft)",
                            color: "var(--gf-success)",
                          }}
                        >
                          Done
                        </span>
                      )}

                      {isOverdue && (
                        <span
                          className="gf-badge"
                          style={{
                            background: "var(--gf-danger-soft)",
                            color: "var(--gf-danger)",
                          }}
                        >
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 items-center gap-2">
                    <AppButton
                      variant="secondary"
                      size="icon"
                      onClick={() => openEditModal(task)}
                      aria-label="Edit task"
                    >
                      ✏️
                    </AppButton>

                    <AppButton
                      variant="danger"
                      size="icon"
                      onClick={() => setTaskToDelete(task)}
                      aria-label="Delete task"
                    >
                      🗑
                    </AppButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SHOW MORE / LESS */}
        {tasks.length > 6 && (
          <div className="mt-5">
            <AppButton
              variant="secondary"
              size="md"
              onClick={() => setShowAllTasks(!showAllTasks)}
            >
              {showAllTasks ? "Show Less ↑" : "Show More →"}
            </AppButton>
          </div>
        )}
      </section>

      {/* ===============================
          ADD TASK MODAL
          =============================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* MODAL BOX */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 my-6 w-full max-w-md rounded-3xl p-6 shadow-2xl"
              style={{
                background: "var(--gf-card)",
                color: "var(--gf-ink)",
              }}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Add New Task
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Create your next productive step
                  </p>
                </div>

                <ModalCloseButton onClick={() => setIsModalOpen(false)} />
              </div>

              {/* MODAL FORM */}
              <div className="mt-6 flex flex-col gap-4">
                {/* TASK NAME INPUT */}
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Task Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="gf-input mt-2"
                  />
                </div>

                {/* DEADLINE INPUT */}
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
                    onChange={(e) => setDeadline(e.target.value)}
                    className="gf-input mt-2"
                  />
                </div>

                {/* ADD ERROR MESSAGE */}
                {addError && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      background: "var(--gf-danger-soft)",
                      color: "var(--gf-danger)",
                    }}
                  >
                    {addError}
                  </p>
                )}

                {/* SAVE BUTTON */}
                <AppButton
                  variant="primary"
                  size="lg"
                  onClick={addTask}
                  className="mt-2"
                >
                  Save Task
                </AppButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===============================
          EDIT TASK MODAL
          =============================== */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* MODAL BOX */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl"
              style={{
                background: "var(--gf-card)",
                color: "var(--gf-ink)",
              }}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Edit Task
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Update your task information
                  </p>
                </div>

                <ModalCloseButton
                  onClick={() => {
                    setEditingTask(null);
                    setEditError("");
                  }}
                />
              </div>

              {/* MODAL FORM */}
              <div className="mt-6 flex flex-col gap-4">
                {/* EDIT TASK NAME INPUT */}
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Task Name
                  </label>

                  <input
                    type="text"
                    value={editTaskName}
                    onChange={(e) => setEditTaskName(e.target.value)}
                    className="gf-input mt-2"
                  />
                </div>

                {/* EDIT DEADLINE INPUT */}
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
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="gf-input mt-2"
                  />
                </div>

                {/* EDIT ERROR MESSAGE */}
                {editError && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      background: "var(--gf-danger-soft)",
                      color: "var(--gf-danger)",
                    }}
                  >
                    {editError}
                  </p>
                )}

                {/* SAVE EDIT BUTTON */}
                <AppButton
                  variant="primary"
                  size="lg"
                  onClick={saveEditedTask}
                  className="mt-2"
                >
                  Save Changes
                </AppButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===============================
          CONFIRM DELETE MODAL
          =============================== */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        title="Delete Task?"
        description="This action will permanently remove this task from your Today Focus."
        itemName={taskToDelete?.text}
        itemDetail={
          taskToDelete ? `Deadline: ${taskToDelete.deadline}` : undefined
        }
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
          }
        }}
      />
    </>
  );
}
