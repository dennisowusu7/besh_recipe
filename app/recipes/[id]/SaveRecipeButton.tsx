"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiHeart } from "react-icons/fi";
import { SaveRecipeButtonProps } from "@/lib/interfaces";

export default function SaveRecipeButton({ recipeId, initialSaveCount = 0 }: SaveRecipeButtonProps) {
    const { data: session, status } = useSession();
    const [isSaved, setIsSaved] = useState(false);
    const [saveCount, setSaveCount] = useState(initialSaveCount);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const user = session?.user as { id?: string; role?: "USER" | "ADMIN" } | undefined;
    const userId = user?.id ? Number(user.id) : undefined;

    // Check if user has saved this recipe
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const checkSaveStatus = async () => {
            try {
                const res = await fetch(`/api/saved-recipes?userId=${userId}&recipeId=${recipeId}`, {
                    cache: "no-store",
                });
                const data = await res.json();
                if (res.ok) {
                    const savedRecipes = Array.isArray(data?.data) ? data.data : [];
                    setIsSaved(savedRecipes.length > 0);
                }
            } catch {
                console.error("Failed to check save status");
            } finally {
                setLoading(false);
            }
        };

        checkSaveStatus();
    }, [userId, recipeId]);

    const handleToggleSave = async () => {
        if (!userId) {
            toast.error("Sign in to save recipes");
            return;
        }

        setSubmitting(true);
        try {
            if (isSaved) {
                // Delete saved recipe
                const res = await fetch(`/api/saved-recipes?userId=${userId}&recipeId=${recipeId}`, {
                    method: "DELETE",
                });

                if (!res.ok) {
                    toast.error("Failed to unsave recipe");
                    setSubmitting(false);
                    return;
                }

                setIsSaved(false);
                setSaveCount(Math.max(0, saveCount - 1));
                toast.success("Recipe removed from saved");
            } else {
                // Save recipe
                const res = await fetch("/api/saved-recipes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, recipeId }),
                });

                const data = await res.json();
                if (!res.ok) {
                    toast.error(data?.err || "Failed to save recipe");
                    setSubmitting(false);
                    return;
                }

                setIsSaved(true);
                setSaveCount(saveCount + 1);
                toast.success("Recipe saved!");
            }
        } catch {
            toast.error("Failed to update save status");
        } finally {
            setSubmitting(false);
        }
    };

    if (status !== "authenticated") {
        return (
            <button
                disabled
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                title="Sign in to save recipes"
            >
                <FiHeart size={20} />
                <span>{saveCount} saves</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleSave}
            disabled={submitting || loading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                isSaved
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                    : "bg-slate-700/30 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50"
            } disabled:opacity-50`}
            title={isSaved ? "Remove from saved" : "Save this recipe"}
        >
            <FiHeart size={20} className={isSaved ? "fill-rose-300" : ""} />
            <span>{saveCount} saves</span>
        </button>
    );
}
