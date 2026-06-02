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
  // STATUS STYLE
  // ===============================
  const getStatusStyle = (internshipStatus: string) => {
    switch (internshipStatus) {
      case "Wishlist":
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };

      case "Applied":
        return {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        };

      case "Interview":
        return {
          background: "var(--gf-yellow-soft)",
          color: "var(--gf-warning)",
        };

      case "Accepted":
        return {
          background: "var(--gf-success-soft)",
          color: "var(--gf-success)",
        };

      case "Rejected":
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
                Internship Tracker
              </p>

              <h1
                className="mt-2 text-3xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Career pipeline
              </h1>

              <p
                className="mt-2 text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Track your internship applications, status, deadlines, and
                follow-up opportunities.
              </p>
            </div>

            <div
              className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
              style={{
                background: "var(--gf-mint)",
                color: "var(--gf-success)",
              }}
            >
              Internship Board
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
                Application Manager
              </h2>

              <p
                className="text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Manage all companies you want to apply to.
              </p>
            </div>

            <AppButton variant="primary" size="lg" onClick={openAddModal}>
              + Add Application
            </AppButton>
          </div>
        </div>

        {/* APPLICATION LIST */}
        <div className="gf-card mt-4 p-6">
          {/* LIST HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Internship Applications
              </p>

              <h2
                className="mt-2 text-xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Application list
              </h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Your application list will appear here.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="gf-input w-full sm:w-auto"
              >
                <option value="All">All</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div
                className="w-full rounded-xl px-3 py-2 text-sm font-medium sm:w-auto"
                style={{
                  background: "var(--gf-surface)",
                  color: "var(--gf-muted)",
                }}
              >
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
            {sortedInternships.map((internship) => {
              const statusStyle = getStatusStyle(internship.status);

              return (
                <div
                  key={internship.id}
                  className="flex flex-col gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                    boxShadow: "var(--gf-shadow-sm)",
                  }}
                >
                  <div className="min-w-0">
                    <h3
                      className="font-semibold"
                      style={{
                        color: "var(--gf-ink)",
                      }}
                    >
                      {internship.company}
                    </h3>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: "var(--gf-muted)",
                      }}
                    >
                      {internship.role}
                    </p>

                    {internship.deadline && (
                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: "var(--gf-muted)",
                        }}
                      >
                        Deadline: {internship.deadline}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="gf-badge"
                      style={{
                        background: statusStyle.background,
                        color: statusStyle.color,
                      }}
                    >
                      {internship.status}
                    </span>

                    {internship.link && (
                      <a
                        href={internship.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:-translate-y-0.5"
                        style={{
                          background: "var(--gf-card)",
                          borderColor: "var(--gf-border-strong)",
                          color: "var(--gf-ink)",
                        }}
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ADD / EDIT APPLICATION MODAL */}
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
                  {editingInternship ? "Edit application" : "New application"}
                </p>

                <h2
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  {editingInternship ? "Edit Application" : "Add Application"}
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Track a new internship opportunity.
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
                  Company
                </label>

                <input
                  type="text"
                  placeholder="Example: Tokopedia"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
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
                  Role
                </label>

                <input
                  type="text"
                  placeholder="Example: Frontend Intern"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
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
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
                  Link
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  className="gf-input mt-2"
                />
              </div>

              {applicationError && (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: "var(--gf-danger-soft)",
                    color: "var(--gf-danger)",
                  }}
                >
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
