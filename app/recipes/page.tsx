"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AddRecipeButton from "./AddRecipeButton";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";
import { toast } from "react-hot-toast";

type Recipe = {
    id: number;
    title: string;
    description?: string | null;
    difficulty: "Easy" | "Medium" | "Hard";
    cuisine?: string | null;
    cookingTime?: number | null;
    imageUrl?: string | null;
    user?: { name: string } | null;
    category?: { name: string } | null;
    ingredients?: Array<{
        id: number;
        quantity?: string | null;
        ingredient?: { id: number; name: string } | null;
    }> | null;
};

const fallbackImage =
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80";

const difficultyClass: Record<string, string> = {
    Easy: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    Hard: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
};

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [selectedCuisine, setSelectedCuisine] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch("/api/recipes");
                if (!res.ok) {
                    toast.error("Failed to load recipes");
                    return;
                }
                const data = await res.json();
                setRecipes(data.data || []);
            } catch (err) {
                toast.error("Error loading recipes");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    
    const filteredRecipes = useMemo(() => {
        return recipes.filter((recipe) => {
            const matchesSearch =
                searchTerm === "" ||
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients?.some(item => 
                    item.ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesDifficulty = selectedDifficulty === "" || recipe.difficulty === selectedDifficulty;
            const matchesCuisine = selectedCuisine === "" || recipe.cuisine?.toLowerCase() === selectedCuisine.toLowerCase();

            return matchesSearch && matchesDifficulty && matchesCuisine;
        });
    }, [recipes, searchTerm, selectedDifficulty, selectedCuisine]);

    
    const uniqueCuisines = useMemo(() => {
        const cuisines = recipes
            .map((r) => r.cuisine)
            .filter((c): c is string => !!c)
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
        return cuisines;
    }, [recipes]);

    const hasActiveFilters = searchTerm || selectedDifficulty || selectedCuisine;

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
            </div>

            <div className="relative mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                                All Recipes
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400">
                            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""} found
                        </p>
                    </div>
                    <AddRecipeButton />
                </div>
                <div className="mb-8 flex gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search recipes by name, cuisine, or ingredient..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-slate-700/50 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                            >
                                <FiX size={20} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 font-semibold ${
                            showFilters || hasActiveFilters
                                ? "bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30"
                                : "bg-slate-700/30 text-slate-300 border-slate-600/50 hover:bg-slate-700/50"
                        }`}
                    >
                        <FiFilter size={20} />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-pink-400" />}
                    </button>
                </div>

                {showFilters && (
                    <div className="mb-8 rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6 grid gap-4 sm:grid-cols-3">
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">Difficulty</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 focus:outline-none focus:border-pink-500/50 cursor-pointer"
                            >
                                <option value="">All Levels</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">Cuisine</label>
                            <select
                                value={selectedCuisine}
                                onChange={(e) => setSelectedCuisine(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 focus:outline-none focus:border-pink-500/50 cursor-pointer"
                            >
                                <option value="">All Cuisines</option>
                                {uniqueCuisines.map((cuisine) => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                            </select>
                        </div>

                        
                        {hasActiveFilters && (
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedDifficulty("");
                                        setSelectedCuisine("");
                                    }}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50 font-semibold transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {searchTerm && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-sm">
                                <span>Search: {searchTerm}</span>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="hover:text-pink-200 transition"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        )}
                        {selectedDifficulty && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm">
                                <span>{selectedDifficulty} Difficulty</span>
                                <button
                                    onClick={() => setSelectedDifficulty("")}
                                    className="hover:text-amber-200 transition"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        )}
                        {selectedCuisine && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm">
                                <span>{selectedCuisine}</span>
                                <button
                                    onClick={() => setSelectedCuisine("")}
                                    className="hover:text-cyan-200 transition"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center min-h-96">
                        <p className="text-slate-400">Loading recipes...</p>
                    </div>
                ) : filteredRecipes.length > 0 ? (
                    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRecipes.map((recipe) => (
                            <Link
                                key={recipe.id}
                                href={`/recipes/${recipe.id}`}
                                className="group overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-900/50"
                            >
                                <div className="relative overflow-hidden h-48">
                                    <Image
                                        src={recipe.imageUrl || fallbackImage}
                                        alt={recipe.title}
                                        width={900}
                                        height={600}
                                        unoptimized
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                </div>
                                <div className="p-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyClass[recipe.difficulty]}`}>
                                            {recipe.difficulty}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {recipe.cookingTime ? `${recipe.cookingTime} min` : "Anytime"}
                                        </span>
                                    </div>
                                    <h2 className="line-clamp-2 text-lg font-bold text-slate-100 mb-2 group-hover:text-pink-400 transition-colors">
                                        {recipe.title}
                                    </h2>
                                    <p className="line-clamp-2 text-sm text-slate-400 mb-4">
                                        {recipe.description || "No description yet."}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="text-slate-400">{recipe.cuisine || "General"}</span>
                                        <span className="text-slate-400">By {recipe.user?.name || "Chef"}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </section>
                ) : (
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-12 text-center">
                        <p className="text-slate-400 text-lg mb-4">No recipes match your search.</p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedDifficulty("");
                                setSelectedCuisine("");
                            }}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
