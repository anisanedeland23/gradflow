"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AppButton from "@/components/AppButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EmptyState from "@/components/EmptyState";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { AssetCategory, AssetItem, AssetType } from "@/types/gradflow";

type SummaryTone = "sky" | "lavender" | "peach" | "mint";

export default function AssetsPage() {
  // ===============================
  // ASSET STATES
  // ===============================
  // assets menyimpan semua resource/link penting user.
  const [assets, setAssets] = useState<AssetItem[]>([]);

  // Form states untuk tambah asset baru.
  const [assetTitle, setAssetTitle] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [assetCategory, setAssetCategory] = useState<AssetCategory>("Project");
  const [assetType, setAssetType] = useState<AssetType>("Link");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetError, setAssetError] = useState("");

  // Asset yang sedang dipilih untuk dihapus.
  const [assetToDelete, setAssetToDelete] = useState<AssetItem | null>(null);

  // ===============================
  // SEARCH + FILTER STATES
  // ===============================
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "All">(
    "All",
  );

  // ===============================
  // LOAD ASSETS
  // ===============================
  useEffect(() => {
    const savedAssets = localStorage.getItem(STORAGE_KEYS.assets);

    if (!savedAssets) return;

    const parsedAssets: AssetItem[] = JSON.parse(savedAssets);

    setAssets(parsedAssets);
  }, []);

  // ===============================
  // SAVE ASSETS HELPER
  // ===============================
  const saveAssets = (updatedAssets: AssetItem[]) => {
    setAssets(updatedAssets);

    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(updatedAssets));
  };

  // ===============================
  // ADD ASSET
  // ===============================
  const addAsset = () => {
    if (assetTitle.trim() === "") {
      setAssetError("Asset title is required.");
      return;
    }

    if (assetUrl.trim() === "") {
      setAssetError("Asset URL is required.");
      return;
    }

    const newAsset: AssetItem = {
      id: Date.now(),
      title: assetTitle.trim(),
      url: assetUrl.trim(),
      category: assetCategory,
      type: assetType,
      description: assetDescription.trim(),
      createdAt: Date.now(),
    };

    const updatedAssets = [newAsset, ...assets];

    saveAssets(updatedAssets);

    setAssetTitle("");
    setAssetUrl("");
    setAssetCategory("Project");
    setAssetType("Link");
    setAssetDescription("");
    setAssetError("");
  };

  // ===============================
  // SUMMARY DATA
  // ===============================
  const totalAssets = assets.length;

  const documentAssets = assets.filter(
    (asset) => asset.type === "Document" || asset.type === "Template",
  ).length;

  const projectAssets = assets.filter(
    (asset) =>
      asset.category === "Project" ||
      asset.type === "Design" ||
      asset.type === "Code" ||
      asset.type === "Dataset",
  ).length;

  const referenceAssets = assets.filter(
    (asset) =>
      asset.type === "Reference" ||
      asset.type === "Video" ||
      asset.type === "Link",
  ).length;

  // ===============================
  // OPEN ASSET LINK
  // ===============================
  const openAssetLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ===============================
  // DELETE ASSET
  // ===============================
  const deleteAsset = (id: number) => {
    const updatedAssets = assets.filter((asset) => asset.id !== id);

    saveAssets(updatedAssets);
    setAssetToDelete(null);
  };

  // ===============================
  // FILTERED ASSETS
  // ===============================
  const filteredAssets = assets.filter((asset) => {
    const normalizedSearchQuery = searchQuery.toLowerCase();

    const matchesSearch =
      asset.title.toLowerCase().includes(normalizedSearchQuery) ||
      asset.description.toLowerCase().includes(normalizedSearchQuery) ||
      asset.url.toLowerCase().includes(normalizedSearchQuery);

    const matchesCategory =
      categoryFilter === "All" || asset.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // ===============================
  // UI HELPERS
  // ===============================
  const toneStyles: Record<
    SummaryTone,
    {
      background: string;
      color: string;
      icon: string;
    }
  > = {
    sky: {
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
      icon: "⌘",
    },
    lavender: {
      background: "var(--gf-lavender)",
      color: "var(--gf-primary)",
      icon: "□",
    },
    peach: {
      background: "var(--gf-peach)",
      color: "var(--gf-warning)",
      icon: "◇",
    },
    mint: {
      background: "var(--gf-mint)",
      color: "var(--gf-success)",
      icon: "✦",
    },
  };

  const summaryItems = [
    {
      title: "Total Assets",
      value: totalAssets,
      description: "All saved resources",
      tone: "sky" as SummaryTone,
    },
    {
      title: "Documents",
      value: documentAssets,
      description: "Docs, reports, templates",
      tone: "lavender" as SummaryTone,
    },
    {
      title: "Project Assets",
      value: projectAssets,
      description: "Design, code, datasets",
      tone: "peach" as SummaryTone,
    },
    {
      title: "References",
      value: referenceAssets,
      description: "Journals, videos, links",
      tone: "mint" as SummaryTone,
    },
  ];

  const getCategoryStyle = (category: AssetCategory) => {
    switch (category) {
      case "Skripsi":
        return {
          background: "var(--gf-lavender)",
          color: "var(--gf-primary)",
        };

      case "Project":
        return {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        };

      case "Career":
        return {
          background: "var(--gf-mint)",
          color: "var(--gf-success)",
        };

      case "Course":
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

  const getTypeStyle = (type: AssetType) => {
    switch (type) {
      case "Document":
      case "Template":
        return {
          background: "var(--gf-lavender)",
          color: "var(--gf-primary)",
        };

      case "Design":
        return {
          background: "var(--gf-rose)",
          color: "var(--gf-danger)",
        };

      case "Code":
      case "Dataset":
        return {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        };

      case "Reference":
      case "Video":
      case "Link":
        return {
          background: "var(--gf-mint)",
          color: "var(--gf-success)",
        };

      default:
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };
    }
  };

  return (
    <main className="gf-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
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
                Assets
              </p>

              <h1
                className="mt-2 text-3xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Resource library
              </h1>

              <p
                className="mt-2 max-w-3xl text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Save and organize important links, references, templates,
                documents, code, designs, datasets, and learning resources.
              </p>
            </div>

            <div
              className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
              style={{
                background: "var(--gf-sky)",
                color: "var(--gf-link)",
              }}
            >
              Academic Assets
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => {
            const tone = toneStyles[item.tone];

            return (
              <div
                key={item.title}
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
                style={{
                  background: "var(--gf-card)",
                  borderColor: "var(--gf-border)",
                  boxShadow: "var(--gf-shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: "var(--gf-muted)",
                      }}
                    >
                      {item.title}
                    </p>

                    <h2
                      className="mt-2 text-2xl font-semibold tracking-tight"
                      style={{
                        color: "var(--gf-ink)",
                      }}
                    >
                      {item.value}
                    </h2>
                  </div>

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
                    style={{
                      background: tone.background,
                      color: tone.color,
                    }}
                  >
                    {tone.icon}
                  </div>
                </div>

                <p
                  className="mt-2 text-xs"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* ADD ASSET FORM */}
          <div className="gf-card p-6 xl:col-span-1">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Add New Asset
              </p>

              <h2
                className="mt-2 text-xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Save Resource
              </h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Add a useful link or reference so you can find it again later.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Asset Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Figma GradFlow Design"
                  value={assetTitle}
                  onChange={(event) => {
                    setAssetTitle(event.target.value);
                    setAssetError("");
                  }}
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
                  Asset URL
                </label>

                <input
                  type="url"
                  placeholder="Paste resource link here..."
                  value={assetUrl}
                  onChange={(event) => {
                    setAssetUrl(event.target.value);
                    setAssetError("");
                  }}
                  className="gf-input mt-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
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
                    value={assetCategory}
                    onChange={(event) =>
                      setAssetCategory(event.target.value as AssetCategory)
                    }
                    className="gf-input mt-2"
                  >
                    <option value="Skripsi">Skripsi</option>
                    <option value="Project">Project</option>
                    <option value="Career">Career</option>
                    <option value="Course">Course</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    className="text-sm font-medium"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Type
                  </label>

                  <select
                    value={assetType}
                    onChange={(event) =>
                      setAssetType(event.target.value as AssetType)
                    }
                    className="gf-input mt-2"
                  >
                    <option value="Document">Document</option>
                    <option value="Design">Design</option>
                    <option value="Code">Code</option>
                    <option value="Dataset">Dataset</option>
                    <option value="Reference">Reference</option>
                    <option value="Template">Template</option>
                    <option value="Video">Video</option>
                    <option value="Link">Link</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Description
                </label>

                <textarea
                  placeholder="Short note about this asset..."
                  value={assetDescription}
                  onChange={(event) => setAssetDescription(event.target.value)}
                  className="gf-input mt-2 min-h-28 resize-none"
                />
              </div>

              <AppButton variant="primary" size="lg" onClick={addAsset}>
                + Save Asset
              </AppButton>

              {assetError && (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: "var(--gf-danger-soft)",
                    color: "var(--gf-danger)",
                  }}
                >
                  {assetError}
                </p>
              )}
            </div>
          </div>

          {/* ASSET LIBRARY */}
          <div className="gf-card p-6 xl:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Asset Library
                </p>

                <h2
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Saved Resources
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Search and filter your saved resources.
                </p>
              </div>

              <div
                className="w-fit rounded-xl px-3 py-2 text-xs font-semibold"
                style={{
                  background: "var(--gf-surface)",
                  color: "var(--gf-muted)",
                }}
              >
                {filteredAssets.length} Items
              </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Search by title, description, or URL..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
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
                  Category Filter
                </label>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value as AssetCategory | "All",
                    )
                  }
                  className="gf-input mt-2"
                >
                  <option value="All">All Categories</option>
                  <option value="Skripsi">Skripsi</option>
                  <option value="Project">Project</option>
                  <option value="Career">Career</option>
                  <option value="Course">Course</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* ASSET LIST */}
            {assets.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  title="No assets saved yet."
                  description="Add your first resource link from the form on the left."
                />
              </div>
            )}

            {assets.length > 0 && filteredAssets.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  title="No matching assets found."
                  description="Try changing your search keyword or category filter."
                />
              </div>
            )}

            {filteredAssets.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3">
                {filteredAssets.map((asset) => {
                  const categoryStyle = getCategoryStyle(asset.category);
                  const typeStyle = getTypeStyle(asset.type);

                  return (
                    <div
                      key={asset.id}
                      className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
                      style={{
                        background: "var(--gf-card-soft)",
                        borderColor: "var(--gf-border)",
                        boxShadow: "var(--gf-shadow-sm)",
                      }}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="gf-badge"
                              style={{
                                background: categoryStyle.background,
                                color: categoryStyle.color,
                              }}
                            >
                              {asset.category}
                            </span>

                            <span
                              className="gf-badge"
                              style={{
                                background: typeStyle.background,
                                color: typeStyle.color,
                              }}
                            >
                              {asset.type}
                            </span>
                          </div>

                          <h3
                            className="mt-3 text-lg font-semibold"
                            style={{
                              color: "var(--gf-ink)",
                            }}
                          >
                            {asset.title}
                          </h3>

                          {asset.description && (
                            <p
                              className="mt-1 text-sm"
                              style={{
                                color: "var(--gf-muted)",
                              }}
                            >
                              {asset.description}
                            </p>
                          )}

                          <p
                            className="mt-2 truncate text-xs"
                            style={{
                              color: "var(--gf-muted)",
                            }}
                          >
                            {asset.url}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <AppButton
                            variant="secondary"
                            size="md"
                            onClick={() => openAssetLink(asset.url)}
                          >
                            Open
                          </AppButton>

                          <AppButton
                            variant="danger"
                            size="icon"
                            onClick={() => setAssetToDelete(asset)}
                          >
                            🗑
                          </AppButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmDeleteModal
        isOpen={!!assetToDelete}
        title="Delete Asset?"
        description="This action will permanently remove this saved resource."
        itemName={assetToDelete?.title}
        itemDetail={assetToDelete?.url}
        onCancel={() => setAssetToDelete(null)}
        onConfirm={() => {
          if (assetToDelete) {
            deleteAsset(assetToDelete.id);
          }
        }}
      />
    </main>
  );
}
