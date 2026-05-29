"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FiUsers, FiBook, FiMessageSquare, FiStar, FiArrowLeft, FiTrash2, FiShield } from "react-icons/fi";
import PageLoading from "@/app/components/PageLoading";
import { DashboardStats, User } from "@/lib/interfaces";
import { FiBarChart2 } from "react-icons/fi";

interface Recipe {
    id: number;
    title: string;
    user: { name: string };
    createdAt: string;
    _count?: {
        comments: number;
        ratings: number;
    };
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [activeTab, setActiveTab] = useState<"stats" | "users" | "recipes">("stats");
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
            router.push("/");
            return;
        }
    }, [status, session, router]);

    useEffect(() => {
        if ((session?.user as any)?.role !== "ADMIN") return;

        const fetchData = async () => {
            try {
                setLoading(true);

                
                const usersRes = await fetch("/api/users");
                const usersData = await usersRes.json();
                if (usersRes.ok) {
                    setUsers(usersData.data || []);
                }

                
                const recipesRes = await fetch("/api/recipes?search=");
                const recipesData = await recipesRes.json();
                if (recipesRes.ok) {
                    setRecipes(recipesData.data || []);
                }

                
                if (usersData && recipesData) {
                    setStats({
                        totalUsers: usersData.data?.length || 0,
                        totalRecipes: recipesData.data?.length || 0,
                        totalComments: recipesData.data?.reduce((sum: number, r: Recipe) => sum + (r._count?.comments || 0), 0) || 0,
                        totalRatings: recipesData.data?.reduce((sum: number, r: Recipe) => sum + (r._count?.ratings || 0), 0) || 0,
                    });
                }
            } catch (err) {
                toast.error("Failed to load admin data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Are you sure? This will delete the user and all their data.")) return;

        setDeleting(userId);
        try {
            const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
            if (!res.ok) {
                toast.error("Failed to delete user");
                return;
            }
            setUsers(users.filter((u) => u.id !== userId));
            toast.success("User deleted successfully");
        } catch (err) {
            toast.error("Error deleting user");
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteRecipe = async (recipeId: number) => {
        if (!window.confirm("Are you sure? This will delete the recipe.")) return;

        setDeleting(recipeId);
        try {
            const res = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
            if (!res.ok) {
                toast.error("Failed to delete recipe");
                return;
            }
            setRecipes(recipes.filter((r) => r.id !== recipeId));
            toast.success("Recipe deleted successfully");
        } catch (err) {
            toast.error("Error deleting recipe");
        } finally {
            setDeleting(null);
        }
    };

    const handlePromoteUser = async (userId: number, newRole: "USER" | "ADMIN") => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) {
                toast.error("Failed to update user role");
                return;
            }

            setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            toast.success(`User role updated to ${newRole}`);
        } catch (err) {
            toast.error("Error updating user role");
        }
    };

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!res.ok) {
                toast.error("Failed to update user status");
                return;
            }

            setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
            toast.success(`User account ${!currentStatus ? "activated" : "deactivated"}`);
        } catch (err) {
            toast.error("Error updating user status");
        }
    };

    if (status === "loading" || loading) {
        return <PageLoading />;
    }

    if ((session?.user as any)?.role !== "ADMIN") {
        return null;
    }

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
            </div>

            <div className="relative mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition mb-4">
                            <FiArrowLeft size={18} />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                                Admin Dashboard
                            </span>
                        </h1>
                        <p className="text-slate-400 mt-2">Manage users, recipes, and community content</p>
                    </div>
                    <FiShield size={40} className="text-purple-400" />
                </div>

                <div className="mb-8 flex gap-4 border-b border-slate-700/50">
                    {[
                        { id: "stats", label: "Dashboard", icon: FiBarChart2 },
                        { id: "users", label: "Users", icon: FiUsers },
                        { id: "recipes", label: "Recipes", icon: FiBook },
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 ${
                                    activeTab === tab.id
                                        ? "border-purple-500 text-purple-400"
                                        : "border-transparent text-slate-400 hover:text-slate-300"
                                }`}
                            >
                                <TabIcon size={20} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "stats" && stats && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                        {[
                            { label: "Total Users", value: stats.totalUsers, icon: FiUsers, color: "from-blue-500 to-cyan-500" },
                            { label: "Total Recipes", value: stats.totalRecipes, icon: FiBook, color: "from-green-500 to-emerald-500" },
                            { label: "Total Comments", value: stats.totalComments, icon: FiMessageSquare, color: "from-pink-500 to-rose-500" },
                            { label: "Total Ratings", value: stats.totalRatings, icon: FiStar, color: "from-yellow-400 to-amber-400" },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-slate-400 text-sm">{stat.label}</p>
                                        <Icon className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} size={24} />
                                    </div>
                                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50 border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Role</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Recipes</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                                            <td className="px-6 py-4 text-slate-200">{user.name}</td>
                                            <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === "ADMIN"
                                                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    (user as any).isActive
                                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                                                }`}>
                                                    {(user as any).isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{user._count?.recipes || 0}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    {user.role !== "ADMIN" && (
                                                        <button
                                                            onClick={() => handlePromoteUser(user.id, "ADMIN")}
                                                            className="px-3 py-1 text-xs rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition whitespace-nowrap"
                                                        >
                                                            Promote
                                                        </button>
                                                    )}
                                                    {user.role === "ADMIN" && (
                                                        <button
                                                            onClick={() => handlePromoteUser(user.id, "USER")}
                                                            className="px-3 py-1 text-xs rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition whitespace-nowrap"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.id, (user as any).isActive)}
                                                        className={`px-3 py-1 text-xs rounded border transition whitespace-nowrap ${
                                                            (user as any).isActive
                                                                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/30"
                                                                : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/30"
                                                        }`}
                                                    >
                                                        {(user as any).isActive ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deleting === user.id}
                                                        className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition disabled:opacity-50 whitespace-nowrap"
                                                    >
                                                        {deleting === user.id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "recipes" && (
                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50 border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Recipe</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Author</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Comments</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Ratings</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Created</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipes.map((recipe) => (
                                        <tr key={recipe.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                                            <td className="px-6 py-4 text-slate-200 font-semibold max-w-xs truncate">{recipe.title}</td>
                                            <td className="px-6 py-4 text-slate-300">{recipe.user?.name}</td>
                                            <td className="px-6 py-4 text-slate-300">{recipe._count?.comments || 0}</td>
                                            <td className="px-6 py-4 text-slate-300">{recipe._count?.ratings || 0}</td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(recipe.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteRecipe(recipe.id)}
                                                    disabled={deleting === recipe.id}
                                                    className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    <FiTrash2 size={14} />
                                                    {deleting === recipe.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}


