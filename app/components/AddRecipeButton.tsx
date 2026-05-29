"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiPlus } from "react-icons/fi";

export default function AddRecipeButton() {
    const { status } = useSession();

    if (status !== "authenticated") return null;

    return (
        <Link
            href="/recipes/add"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
        >
            <FiPlus size={20} />
            <span>Add Recipe</span>
        </Link>
    );
}
