"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TodayFocus from "@/components/TodayFocus";
import StatsSection from "@/components/StatsSection";
import ProgressOverview from "@/components/ProgressOverview";
import DeadlineSection from "@/components/DeadlineSection";
import ProductivitySnapshot from "@/components/ProductivitySnapshot";
import WeeklyFocus from "@/components/WeeklyFocus";
import ReminderNotes from "@/components/ReminderNotes";
import RecentActivity from "@/components/RecentActivity";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { Task, Internship, Goal } from "@/types/gradflow";

type StreakData = {
  currentStreak: number;
  lastActiveDate: string;
};

export default function Home() {
  // ===============================
  // MAIN STATES
  // ===============================
  // tasks menyimpan semua data task dari Today Focus.
  const [tasks, setTasks] = useState<Task[]>([]);

  // isTasksLoaded memastikan task selesai dibaca dari localStorage
  // sebelum disimpan ulang.
  const [isTasksLoaded, setIsTasksLoaded] = useState(false);

  // streak menyimpan jumlah hari konsisten user menyelesaikan task.
  const [streak, setStreak] = useState(0);

  // internships menyimpan data dari halaman Magang.
  const [internships, setInternships] = useState<Internship[]>([]);

  // goals menyimpan data dari halaman Goals.
  const [goals, setGoals] = useState<Goal[]>([]);

  // ===============================
  // DATE HELPER
  // ===============================
  // Menghasilkan tanggal hari ini dalam format YYYY-MM-DD.
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // ===============================
  // LOAD TASKS
  // ===============================
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEYS.tasks);

    if (savedTasks) {
      const parsedTasks: Task[] = JSON.parse(savedTasks);

      setTasks(parsedTasks);
    }

    setIsTasksLoaded(true);
  }, []);

  // ===============================
  // SAVE TASKS
  // ===============================
  // Guard isTasksLoaded mencegah data lama ketimpa array kosong.
  useEffect(() => {
    if (!isTasksLoaded) return;

    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks, isTasksLoaded]);

  // ===============================
  // LOAD STREAK
  // ===============================
  useEffect(() => {
    const savedStreak = localStorage.getItem(STORAGE_KEYS.streak);

    if (savedStreak) {
      const parsedStreak: StreakData = JSON.parse(savedStreak);

      setStreak(parsedStreak.currentStreak);
    }
  }, []);

  // ===============================
  // LOAD INTERNSHIPS
  // ===============================
  useEffect(() => {
    const savedInternships = localStorage.getItem(STORAGE_KEYS.internships);

    if (savedInternships) {
      const parsedInternships: Internship[] = JSON.parse(savedInternships);

      setInternships(parsedInternships);
    }
  }, []);

  // ===============================
  // LOAD GOALS
  // ===============================
  useEffect(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEYS.goals);

    if (savedGoals) {
      const parsedGoals: Goal[] = JSON.parse(savedGoals);

      setGoals(parsedGoals);
    }
  }, []);

  // ===============================
  // TASK CALCULATION
  // ===============================
  const completedTasks = tasks.filter((task) => task.completed).length;

  const progressPercentage =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  // ===============================
  // STREAK SYSTEM
  // ===============================
  const updateStreak = () => {
    const today = getTodayDate();

    const savedStreak = localStorage.getItem(STORAGE_KEYS.streak);

    // Kalau belum ada data streak sama sekali, buat streak pertama.
    if (!savedStreak) {
      const newStreak: StreakData = {
        currentStreak: 1,
        lastActiveDate: today,
      };

      localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(newStreak));

      setStreak(1);

      return;
    }

    const parsedStreak: StreakData = JSON.parse(savedStreak);

    // Kalau user sudah menyelesaikan task hari ini,
    // streak tidak perlu ditambah lagi.
    if (parsedStreak.lastActiveDate === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayDate = yesterday.toISOString().split("T")[0];

    const newCurrentStreak =
      parsedStreak.lastActiveDate === yesterdayDate
        ? parsedStreak.currentStreak + 1
        : 1;

    const updatedStreak: StreakData = {
      currentStreak: newCurrentStreak,
      lastActiveDate: today,
    };

    localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(updatedStreak));

    setStreak(newCurrentStreak);
  };

  // ===============================
  // INTERNSHIP PROGRESS
  // ===============================
  // Wishlist = belum progress
  // Applied, Interview, Accepted = sudah ada progress
  // Rejected = tidak dihitung sebagai progress aktif
  const progressedInternships = internships.filter(
    (internship) =>
      internship.status === "Applied" ||
      internship.status === "Interview" ||
      internship.status === "Accepted",
  ).length;

  const internshipProgress =
    internships.length === 0
      ? 0
      : Math.round((progressedInternships / internships.length) * 100);

  // ===============================
  // GOALS PROGRESS
  // ===============================
  const totalGoalProgress = goals.reduce((total, goal) => {
    if (goal.target === 0) return total;

    const goalPercentage = Math.min(
      Math.round((goal.progress / goal.target) * 100),
      100,
    );

    return total + goalPercentage;
  }, 0);

  const goalsProgress =
    goals.length === 0 ? 0 : Math.round(totalGoalProgress / goals.length);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex flex-col lg:flex-row">
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <section className="flex-1 p-3 sm:p-4 lg:p-5">
          {/* HEADER */}
          <Header />

          {/* TODAY FOCUS */}
          <div className="mt-3">
            <TodayFocus
              tasks={tasks}
              setTasks={setTasks}
              completedTasks={completedTasks}
              updateStreak={updateStreak}
            />
          </div>

          {/* ROW 1 */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ProgressOverview
              progressPercentage={progressPercentage}
              internshipProgress={internshipProgress}
              goalsProgress={goalsProgress}
            />

            <DeadlineSection />

            <StatsSection
              tasks={tasks}
              streak={streak}
              internships={internships}
              goals={goals}
            />
          </div>

          {/* ROW 2 */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ProductivitySnapshot
              tasks={tasks}
              internships={internships}
              goals={goals}
            />

            <WeeklyFocus
              tasks={tasks}
              internships={internships}
              goals={goals}
            />
            <ReminderNotes />
          </div>

          {/* ROW 3 */}
          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentActivity />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
