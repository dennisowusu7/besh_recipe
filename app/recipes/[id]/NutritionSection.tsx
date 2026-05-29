"use client";

import { useEffect, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";
import { NutritionData, NutritionSectionProps } from "@/lib/interfaces";


export default function NutritionSection({ recipeTitle, servings = 4 }: NutritionSectionProps) {
    const [nutrition, setNutrition] = useState<NutritionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNutrition = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/api/nutrition?recipe=${encodeURIComponent(recipeTitle)}&servings=${servings}`);
                const data = await res.json();

                if (!res.ok || !data.data) {
                    setError("Nutrition data not available");
                    return;
                }

                setNutrition(data.data);
            } catch (err) {
                setError("Failed to load nutrition data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNutrition();
    }, [recipeTitle, servings]);

    if (loading) {
        return (
            <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <FiBarChart2 size={24} className="text-yellow-400" />
                    <h2 className="text-2xl font-bold text-slate-100">Nutrition (Per Serving)</h2>
                </div>
                <div className="text-slate-400">Loading nutrition data...</div>
            </section>
        );
    }

    if (error || !nutrition) {
        return (
            <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <FiBarChart2 size={24} className="text-yellow-400" />
                    <h2 className="text-2xl font-bold text-slate-100">Nutrition</h2>
                </div>
                <p className="text-slate-400 text-sm">{error || "Nutrition data not available for this recipe"}</p>
            </section>
        );
    }

    const nutrients = [
        { label: "Calories", value: nutrition.calories, unit: "kcal", color: "from-orange-500 to-red-500" },
        { label: "Protein", value: nutrition.protein, unit: "g", color: "from-red-500 to-pink-500" },
        { label: "Carbs", value: nutrition.carbs, unit: "g", color: "from-yellow-400 to-amber-400" },
        { label: "Fat", value: nutrition.fat, unit: "g", color: "from-cyan-500 to-blue-500" },
        { label: "Fiber", value: nutrition.fiber, unit: "g", color: "from-green-500 to-emerald-500" },
        { label: "Sugar", value: nutrition.sugar, unit: "g", color: "from-pink-400 to-rose-400" },
    ];

    return (
        <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-8">
                <FiBarChart2 size={24} className="text-yellow-400" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Nutrition Facts</h2>
                    <p className="text-sm text-slate-400">Per serving ({servings} servings total)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nutrients.map((nutrient, idx) => (
                    <div
                        key={idx}
                        className="rounded-lg border border-slate-700/50 bg-slate-700/20 backdrop-blur-sm p-4 hover:bg-slate-700/30 transition"
                    >
                        <p className="text-sm text-slate-400 mb-2">{nutrient.label}</p>
                        <div className="flex items-end gap-2">
                            <span className={`bg-gradient-to-r ${nutrient.color} bg-clip-text text-transparent text-2xl font-bold`}>
                                {nutrient.value}
                            </span>
                            <span className="text-sm text-slate-500 mb-1">{nutrient.unit}</span>
                        </div>
                        <div className="mt-2 h-1 w-full bg-slate-600/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${nutrient.color}`}
                                style={{
                                    width: `${Math.min((nutrient.value / Math.max(...nutrients.map((n) => n.value))) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 rounded-lg border border-slate-700/50 bg-slate-700/10 text-sm text-slate-400">
                <p>💡 <span className="text-slate-300">Tip:</span> Nutrition data is estimated based on recipe title. For more accuracy, verify against your actual ingredients.</p>
            </div>
        </section>
    );
}
