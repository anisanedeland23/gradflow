## 🌐 Live Demo

GradFlow is live at:

https://gradflow-rosy.vercel.app

---

## ☁️ Cloud Sync

GradFlow now supports Supabase authentication and automatic cloud sync.

Current sync behavior:

- Users can sign up and sign in with email and password.
- Data is automatically loaded from Supabase after login.
- Changes are automatically saved to Supabase.
- Data can be accessed from multiple devices using the same account.

The current database strategy uses a single JSONB row per user for fast MVP development.

# GradFlow

GradFlow is a personal academic productivity dashboard designed to help students manage their study flow, thesis progress, internship applications, goals, resources, and daily focus sessions in one workspace.

This project is built as a personal productivity system for academic and career preparation, with a calm dashboard experience and a signature **Focus Flight Pomodoro system**.

---

## ✨ Features

### Dashboard

- Today Focus task manager
- Progress overview
- Upcoming deadlines
- Productivity stats
- Weekly focus summary
- Reminder and quick notes
- Recent activity log

### TTU / Skripsi

- Main document link manager
- Thesis status and next action tracker
- Chapter progress tracker
- Revision checklist
- Guidance notes
- Important thesis deadlines

### Internship Tracker

- Internship application list
- Status tracking: Wishlist, Applied, Interview, Accepted, Rejected
- Deadline tracking
- Application link storage
- Status filter

### Calendar

- Monthly calendar view
- Academic events and deadlines
- Event types: Assignment, Quiz, Test, Event, Guidance, Meeting
- Add, edit, and delete events

### Daily Log

- Focus Flight Pomodoro timer
- Focus and break/transit mode
- Persistent global timer
- Daily focus summary
- Focus streak
- Focus level and XP system
- Focus contribution grid
- Weekly evaluation
- Daily reflection

### Goals

- Academic, career, project, skill, and personal goals
- Progress and target tracking
- Goal status tracking

### Assets

- Resource library for important links
- Categories and types
- Search and filter
- Open and delete resources

### Theme System

- Light mode
- Night mode
- Token-based GradFlow design system

---

## 🛠️ Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- LocalStorage for MVP data persistence
- Framer Motion
- date-fns

---

## 🎯 Project Purpose

GradFlow was created to support students who need a simple but structured system to manage academic tasks, thesis work, internship preparation, and daily productivity.

The main idea is to keep everything important in one place while making the experience feel calm, focused, and motivating.

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/anisanedeland23/gradflow.git
```

Go to the project folder:

```bash
cd gradflow
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:

```bash
http://localhost:3000
```

---

## 📁 Main Pages

```txt
/              Dashboard
/calendar      Calendar
/daily-log     Daily Log
/ttu           TTU / Skripsi
/magang        Internship Tracker
/goals         Goals
/assets        Assets
```

---

## 📌 Current Status

GradFlow is currently in the MVP stage with a usable Phase 11 UI redesign.

Completed:

- Core dashboard
- Task management
- Calendar
- Internship tracker
- Goals
- TTU / Skripsi page
- Assets library
- Daily Log and Focus Flight
- Light/Night theme system
- Usable UI redesign

Next possible improvements:

- Supabase backend integration
- Authentication
- Cloud sync
- Better mobile polish
- Advanced analytics
- Export data feature

---

## 👩‍💻 Author

Created by **Anisa Nedeland**
Informatics Engineering Student
Universitas Kristen Satya Wacana
