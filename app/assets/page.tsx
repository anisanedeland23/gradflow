"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AppButton from "@/components/AppButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { AssetCategory, AssetItem, AssetType } from "@/types/gradflow";

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

  return (
    <main className="gf-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <section className="min-h-screen p-3 pt-20 sm:p-4 sm:pt-20 lg:ml-72 lg:p-5">
        {/* PAGE HEADER */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Assets</h1>

              <p className="mt-2 text-slate-500">
                Save and organize important links, references, templates,
                documents, code, designs, datasets, and learning resources.
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700">
              Resource Library
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Assets</p>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              {totalAssets}
            </h2>

            <p className="mt-1 text-xs text-slate-400">All saved resources</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Documents</p>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              {documentAssets}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Docs, reports, templates
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Project Assets</p>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              {projectAssets}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Design, code, datasets
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">References</p>

            <h2 className="mt-2 text-2xl font-bold text-slate-800">
              {referenceAssets}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Journals, videos, links
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* ADD ASSET FORM */}
          <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Add New Asset
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-800">
                Save Resource
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a useful link or reference so you can find it again later.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    value={assetCategory}
                    onChange={(event) =>
                      setAssetCategory(event.target.value as AssetCategory)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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
                  <label className="text-sm font-medium text-slate-700">
                    Type
                  </label>

                  <select
                    value={assetType}
                    onChange={(event) =>
                      setAssetType(event.target.value as AssetType)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  placeholder="Short note about this asset..."
                  value={assetDescription}
                  onChange={(event) => setAssetDescription(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <AppButton variant="primary" size="lg" onClick={addAsset}>
                + Save Asset
              </AppButton>

              {assetError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {assetError}
                </p>
              )}
            </div>
          </div>

          {/* ASSET LIBRARY */}
          <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Asset Library
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  Saved Resources
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search and filter your saved resources.
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                {filteredAssets.length} Items
              </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Search by title, description, or URL..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Category Filter
                </label>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value as AssetCategory | "All",
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No assets saved yet.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Add your first resource link from the form on the left.
                </p>
              </div>
            )}

            {assets.length > 0 && filteredAssets.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No matching assets found.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search keyword or category filter.
                </p>
              </div>
            )}

            {filteredAssets.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            {asset.category}
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {asset.type}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-slate-800">
                          {asset.title}
                        </h3>

                        {asset.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {asset.description}
                          </p>
                        )}

                        <p className="mt-2 truncate text-xs text-slate-400">
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
                ))}
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
