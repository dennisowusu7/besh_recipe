"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi";
import { Category } from "@/lib/types";

export default function CategoriesPage() {
    const { data: session, status } = useSession();
    const isAdmin = status === "authenticated" && (session?.user as any)?.role === "ADMIN";
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [expandedDetails, setExpandedDetails] = useState<any | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/categories", { cache: "no-store" });
                const payload = await res.json().catch(() => null);
                if (!res.ok) {
                    setError(payload?.err || "Failed to load categories.");
                    return;
                }
                const list = Array.isArray(payload?.data) ? payload.data : [];
                setCategories(list);
            } catch {
                setError("Failed to load categories.");
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(q));
    }, [categories, search]);

    const handleSubmit = async () => {
        const normalizedName = formData.name.trim();
        if (!normalizedName) {
            toast.error("Category name is required");
            return;
        }

        try {
            setSubmitting(true);
            const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
            const method = editingId ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: normalizedName,
                    description: formData.description.trim(),
                }),
            });

            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                toast.error(payload?.err || "Failed to save category");
                return;
            }

            toast.success(editingId ? "Category updated successfully" : "Category added successfully");
            setFormData({ name: "", description: "" });
            setEditingId(null);
            setShowModal(false);
            
            // Refresh categories
            const refreshRes = await fetch("/api/categories", { cache: "no-store" });
            const refreshData = await refreshRes.json().catch(() => null);
            if (refreshRes.ok) {
                setCategories(Array.isArray(refreshData?.data) ? refreshData.data : []);
            }
        } catch (err) {
            toast.error("Error saving category");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                toast.error(payload?.err || "Failed to delete category");
                return;
            }

            toast.success("Category deleted successfully");
            
            // Refresh categories
            const refreshRes = await fetch("/api/categories", { cache: "no-store" });
            const refreshData = await refreshRes.json().catch(() => null);
            if (refreshRes.ok) {
                setCategories(Array.isArray(refreshData?.data) ? refreshData.data : []);
            }
        } catch (err) {
            toast.error("Error deleting category");
            console.error(err);
        }
    };

    const fetchCategoryDetails = async (id: number) => {
        try {
            setLoadingDetails(true);
            const res = await fetch(`/api/categories/${id}`, { cache: "no-store" });
            const payload = await res.json();

            if (!res.ok) {
                toast.error("Failed to load category details");
                return;
            }

            setExpandedDetails(payload?.data);
        } catch {
            toast.error("Failed to load category details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleToggleExpand = (id: number) => {
        if (expandedId === id) {
            setExpandedId(null);
            setExpandedDetails(null);
        } else {
            setExpandedId(id);
            fetchCategoryDetails(id);
        }
    };

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
            </div>

            <div className="relative mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                                Recipe Categories
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400">
                            Browse {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"} to discover recipes faster.
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ name: "", description: "" });
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 whitespace-nowrap"
                        >
                            <FiPlus size={20} />
                            Add Category
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="mb-8 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-slate-700/50 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                        >
                            <FiX size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse" />
                        </div>
                        <p className="ml-4 text-slate-400">Loading categories...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-6">
                        <p className="text-rose-300">{error}</p>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg mb-4">No categories found.</p>
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: "", description: "" });
                                    setShowModal(true);
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                            >
                                <FiPlus size={20} />
                                Create First Category
                            </button>
                        )}
                    </div>
                )}

                {/* Categories Grid */}
                {!loading && !error && filtered.length > 0 && (
                    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((category) => (
                            <article
                                key={category.id}
                                className="group rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden hover:border-pink-500/50 hover:from-slate-800 hover:to-slate-800 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-slate-100 group-hover:text-pink-400 transition-colors">
                                                {category.name}
                                            </h2>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setFormData({
                                                            name: category.name,
                                                            description: category.description || "",
                                                        });
                                                        setEditingId(category.id);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                                        {category.description || "No description available."}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 text-sm font-semibold border border-pink-500/30">
                                            {category._count?.recipes ?? 0} recipe{(category._count?.recipes ?? 0) !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                {/* Expand Button */}
                                {(category._count?.recipes ?? 0) > 0 && (
                                    <button
                                        onClick={() => handleToggleExpand(category.id)}
                                        className={`w-full px-6 py-3 text-left flex items-center justify-between border-t border-slate-700 bg-slate-700/30 hover:bg-slate-700/60 transition-all duration-200 text-gray-300 font-semibold ${
                                            expandedId === category.id ? 'bg-slate-700/60' : ''
                                        }`}
                                    >
                                        <span>View Recipes</span>
                                        <FiChevronDown
                                            size={20}
                                            className={`transition-transform duration-300 ${
                                                expandedId === category.id ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                )}

                                {/* Expanded Details */}
                                {expandedId === category.id && (
                                    <div className="border-t border-slate-700 p-6 bg-slate-900/50 space-y-3 max-h-96 overflow-y-auto">
                                        {loadingDetails ? (
                                            <p className="text-gray-400 text-center py-4">Loading recipes...</p>
                                        ) : expandedDetails && expandedDetails.recipes && expandedDetails.recipes.length > 0 ? (
                                            expandedDetails.recipes.map((recipe: any) => (
                                                <Link
                                                    key={recipe.id}
                                                    href={`/recipes/${recipe.id}`}
                                                    className="block p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 cursor-pointer group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {recipe.imageUrl && (
                                                            <img
                                                                src={recipe.imageUrl}
                                                                alt={recipe.title}
                                                                className="w-12 h-12 rounded object-cover flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-white truncate group-hover:text-pink-400 transition-colors">
                                                                {recipe.title}
                                                            </h4>
                                                            {recipe.difficulty && (
                                                                <span className="inline-block mt-1 text-xs font-semibold px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                                                                    {recipe.difficulty}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-2">No recipes yet</p>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </section>
                )}
            </div>

            {/* Modal - Add/Edit Category */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">
                                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                                    {editingId ? "Edit Category" : "Add New Category"}
                                </span>
                            </h2>
                            <p className="text-sm text-slate-400">
                                {editingId ? "Update the category details" : "Create a new recipe category"}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., Desserts"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-slate-700/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Brief description of this category"
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-slate-700/50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                    setFormData({ name: "", description: "" });
                                }}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-600/50 text-slate-300 font-semibold hover:bg-slate-700/30 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : editingId ? "Update Category" : "Add Category"}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setShowModal(false);
                                setEditingId(null);
                                setFormData({ name: "", description: "" });
                            }}
                            disabled={submitting}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
