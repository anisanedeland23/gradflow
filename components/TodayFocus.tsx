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

  return (
    <>
      {/* ===============================
          MAIN CARD
          =============================== */}
      <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-sm">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Today Focus</h2>

            <p className="text-sm text-slate-400">
              {completedTasks}/{tasks.length} tasks completed
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

        {/* TASK LIST */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                className={`flex items-center gap-2 rounded-lg p-2 transition hover:bg-slate-800 ${
                  isOverdue ? "border border-red-500/40 bg-red-500/10" : ""
                }`}
              >
                {/* CHECKBOX */}
                <div
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border text-xs transition ${
                    task.completed
                      ? "border-green-500 bg-green-500"
                      : "border-white"
                  }`}
                >
                  {task.completed && "✓"}
                </div>

                {/* TASK TEXT */}
                <div className="flex flex-1 items-center gap-2">
                  <p
                    className={`text-sm ${
                      task.completed
                        ? "text-slate-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {task.text}
                  </p>

                  {/* OVERDUE BADGE */}
                  {isOverdue && (
                    <span className="rounded-full bg-red-500/20 px-2 py-1 text-[10px] font-medium text-red-300">
                      OVERDUE
                    </span>
                  )}
                </div>

                {/* EDIT BUTTON */}
                <AppButton
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(task)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  ✏️
                </AppButton>

                {/* DELETE BUTTON */}
                <AppButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setTaskToDelete(task)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  🗑
                </AppButton>
              </div>
            );
          })}
        </div>

        {/* SHOW MORE / LESS */}
        {tasks.length > 6 && (
          <AppButton
            variant="ghost"
            size="md"
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            {showAllTasks ? "Show Less ↑" : "Show More →"}
          </AppButton>
        )}
      </div>

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
              className="relative z-10 my-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Add New Task
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create your next productive step
                  </p>
                </div>

                <ModalCloseButton onClick={() => setIsModalOpen(false)} />
              </div>

              {/* MODAL FORM */}
              <div className="mt-6 flex flex-col gap-4">
                {/* TASK NAME INPUT */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Task Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                {/* DEADLINE INPUT */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                {/* ADD ERROR MESSAGE */}
                {addError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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
              className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Edit Task
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
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
                  <label className="text-sm font-medium text-slate-700">
                    Task Name
                  </label>

                  <input
                    type="text"
                    value={editTaskName}
                    onChange={(e) => setEditTaskName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                {/* EDIT DEADLINE INPUT */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                {/* EDIT ERROR MESSAGE */}
                {editError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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
