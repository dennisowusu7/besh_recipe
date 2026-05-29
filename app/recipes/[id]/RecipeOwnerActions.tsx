"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { OwnerProps } from "@/lib/types";


export default function RecipeOwnerActions({ recipeId, ownerId }: OwnerProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const user = session?.user as { id?: string; role?: "USER" | "ADMIN" } | undefined;

    if (status !== "authenticated") return null;

    const isAdmin = user?.role === "ADMIN";
    const isOwner = Number(user?.id) === ownerId;
    if (!isAdmin && !isOwner) return null;

    const handleDelete = async () => {
        const confirmed = window.confirm("Delete this recipe permanently?");
        if (!confirmed) return;

        const toastId = "delete-recipe";
        toast.loading("Deleting recipe...", { id: toastId });
        try {
            const res = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                toast.error(payload?.err || "Failed to delete recipe.", { id: toastId });
                return;
            }
            toast.success("Recipe deleted.", { id: toastId });
            router.push("/recipes");
            router.refresh();
        } catch {
            toast.error("Failed to delete recipe.", { id: toastId });
        }
    };

    return (
        <div className="mt-5 flex gap-3">
            <Link
                href={`/recipes/edit/${recipeId}`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                Edit Recipe
            </Link>
            <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
                Delete Recipe
            </button>
        </div>
    );
}
