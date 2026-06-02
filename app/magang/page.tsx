"use client";

import Sidebar from "@/components/Sidebar";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import AppButton from "@/components/AppButton";
import ModalCloseButton from "@/components/ModalCloseButton";
import EmptyState from "@/components/EmptyState";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { Internship } from "@/types/gradflow";
import { useEffect, useState } from "react";
import { addActivityLog } from "@/lib/activityLog";

export default function MagangPage() {
  // ===============================
  // MAIN STATES
  // ===============================
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ===============================
  // MODAL STATE
  // ===============================
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===============================
  // FORM STATES
  // ===============================
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Wishlist");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [applicationError, setApplicationError] = useState("");

  // ===============================
  // FILTER & EDIT STATES
  // ===============================
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [editingInternship, setEditingInternship] = useState<Internship | null>(
    null,
  );

  const [internshipToDelete, setInternshipToDelete] =
    useState<Internship | null>(null);

  // ===============================
  // LOAD INTERNSHIPS
  // ===============================
  useEffect(() => {
    const savedInternships = localStorage.getItem(STORAGE_KEYS.internships);

    if (savedInternships) {
      const parsedInternships: Internship[] = JSON.parse(savedInternships);

      setInternships(parsedInternships);
    }

    setIsLoaded(true);
  }, []);

  // ===============================
  // SAVE INTERNSHIPS
  // ===============================
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(STORAGE_KEYS.internships, JSON.stringify(internships));
  }, [internships, isLoaded]);

  // ===============================
  // DEADLINE HELPER
  // ===============================
  const isDeadlinePassed = (deadline: string) => {
    if (!deadline) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(`${deadline}T00:00:00`);

    return deadlineDate < today;
  };

  // ===============================
  // AUTO REJECT EXPIRED APPLICATIONS
  // ===============================
  // Kalau status masih Applied dan deadline sudah lewat,
  // status otomatis berubah menjadi Rejected.
  useEffect(() => {
    if (!isLoaded) return;

    let hasChanges = false;

    const updatedInternships = internships.map((internship) => {
      if (
        internship.status === "Applied" &&
        isDeadlinePassed(internship.deadline)
      ) {
        hasChanges = true;

        return {
          ...internship,
          status: "Rejected",
        };
      }

      return internship;
    });

    if (hasChanges) {
      setInternships(updatedInternships);
    }
  }, [internships, isLoaded]);

  // ===============================
  // FORM HELPERS
  // ===============================
  const resetForm = () => {
    setCompany("");
    setRole("");
    setStatus("Wishlist");
    setDeadline("");
    setLink("");
    setApplicationError("");
    setEditingInternship(null);
  };

  const openAddModal = () => {
    resetForm();

    setIsModalOpen(true);
  };

  const openEditModal = (internship: Internship) => {
    setEditingInternship(internship);

    setCompany(internship.company);
    setRole(internship.role);
    setStatus(internship.status);
    setDeadline(internship.deadline);
    setLink(internship.link);
    setApplicationError("");

    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetForm();

    setIsModalOpen(false);
  };

  // ===============================
  // LINK VALIDATION
  // ===============================
  const isValidLink = (link: string) => {
    if (link.trim() === "") return true;

    return link.startsWith("http://") || link.startsWith("https://");
  };

  // ===============================
  // ADD / SAVE APPLICATION
  // ===============================
  const addApplication = () => {
    if (company.trim() === "") {
      setApplicationError("Company is required.");
      return;
    }

    if (role.trim() === "") {
      setApplicationError("Role is required.");
      return;
    }

    if (!isValidLink(link)) {
      setApplicationError("Link must start with http:// or https://");
      return;
    }

    if (editingInternship) {
      const updatedInternships = internships.map((internship) => {
        if (internship.id === editingInternship.id) {
          return {
            ...internship,
            company,
            role,
            status,
            deadline,
            link,
          };
        }

        return internship;
      });

      setInternships(updatedInternships);
    } else {
      const newApplication: Internship = {
        id: Date.now(),
        company,
        role,
        status,
        deadline,
        link,
        createdAt: Date.now(),
      };

      setInternships([...internships, newApplication]);

      addActivityLog({
        type: "internship_added",
        title: "Added internship application",
        description: `${newApplication.company} • ${newApplication.role}`,
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // ===============================
  // DELETE APPLICATION
  // ===============================
  const deleteApplication = (id: number) => {
    const deletedInternship = internships.find(
      (internship) => internship.id === id,
    );

    const filteredInternships = internships.filter(
      (internship) => internship.id !== id,
    );

    setInternships(filteredInternships);

    if (deletedInternship) {
      addActivityLog({
        type: "internship_deleted",
        title: "Deleted internship application",
        description: `${deletedInternship.company} • ${deletedInternship.role}`,
      });
    }

    setInternshipToDelete(null);
  };

  // ===============================
  // STATUS COLOR
  // ===============================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Wishlist":
        return "bg-slate-100 text-slate-700";

      case "Applied":
        return "bg-blue-100 text-blue-700";

      case "Interview":
        return "bg-yellow-100 text-yellow-700";

      case "Accepted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ===============================
  // FILTER INTERNSHIPS
  // ===============================
  const filteredInternships =
    selectedStatus === "All"
      ? internships
      : internships.filter(
          (internship) => internship.status === selectedStatus,
        );

  // ===============================
  // SORT INTERNSHIPS
  // ===============================
  // Rejected selalu turun ke bawah.
  const sortedInternships = [...filteredInternships].sort((a, b) => {
    if (a.status === "Rejected" && b.status !== "Rejected") {
      return 1;
    }

    if (a.status !== "Rejected" && b.status === "Rejected") {
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
            <h1 className="text-3xl font-bold text-slate-800">
              Internship Tracker
            </h1>

            <p className="mt-2 text-slate-500">
              Track your internship applications, status, and deadlines.
            </p>

            {/* ACTION BAR */}
            <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Application Manager
                </h2>

                <p className="text-sm text-slate-500">
                  Manage all companies you want to apply to.
                </p>
              </div>

              <AppButton variant="primary" size="lg" onClick={openAddModal}>
                + Add Application
              </AppButton>
            </div>
          </div>

          {/* APPLICATION LIST */}
          <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
            {/* LIST HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Internship Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your application list will appear here.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 sm:w-auto"
                >
                  <option value="All">All</option>
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <div className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 sm:w-auto">
                  {filteredInternships.length} Applications
                </div>
              </div>
            </div>

            {/* EMPTY STATE */}
            {filteredInternships.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  title="No internship applications found."
                  description="Add your first application to start tracking opportunities."
                />
              </div>
            )}

            {/* APPLICATION ITEMS */}
            <div className="mt-6 grid gap-3">
              {sortedInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {internship.company}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {internship.role}
                    </p>

                    {internship.deadline && (
                      <p className="mt-1 text-xs text-slate-400">
                        Deadline: {internship.deadline}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${getStatusColor(
                        internship.status,
                      )}`}
                    >
                      {internship.status}
                    </span>

                    {internship.link && (
                      <a
                        href={internship.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        Open Link
                      </a>
                    )}

                    <AppButton
                      variant="warning"
                      size="icon"
                      onClick={() => openEditModal(internship)}
                    >
                      ✏️
                    </AppButton>

                    <AppButton
                      variant="danger"
                      size="icon"
                      onClick={() => setInternshipToDelete(internship)}
                    >
                      🗑
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ADD / EDIT APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="my-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingInternship ? "Edit Application" : "Add Application"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track a new internship opportunity
                </p>
              </div>

              <ModalCloseButton onClick={closeModal} />
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Company
                </label>

                <input
                  type="text"
                  placeholder="Example: Tokopedia"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>

                <input
                  type="text"
                  placeholder="Example: Frontend Intern"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
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
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
                  Link
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              {applicationError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {applicationError}
                </p>
              )}

              <AppButton
                variant="primary"
                size="lg"
                onClick={addApplication}
                className="mt-2"
              >
                {editingInternship ? "Save Changes" : "Save Application"}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* DELETE APPLICATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!internshipToDelete}
        title="Delete Application?"
        description="This action will permanently remove this internship application from your tracker."
        itemName={internshipToDelete?.company}
        itemDetail={
          internshipToDelete
            ? `${internshipToDelete.role} • ${internshipToDelete.status}`
            : undefined
        }
        onCancel={() => setInternshipToDelete(null)}
        onConfirm={() => {
          if (internshipToDelete) {
            deleteApplication(internshipToDelete.id);
          }
        }}
      />
    </main>
  );
}
