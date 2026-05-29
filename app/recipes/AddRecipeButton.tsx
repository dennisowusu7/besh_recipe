"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AddRecipeButton() {
    const { status } = useSession();

    if (status !== "authenticated") return null;

    return (
        <Link
            href="/recipes/add"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
        >
            Add Recipe
        </Link>
    );
}
