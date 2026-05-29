"use client";

interface RecipeIngredient {
    id: number;
    quantity?: string | null;
    ingredient?: { id: number; name: string } | null;
}

interface RecipeIngredientsListProps {
    ingredients?: RecipeIngredient[] | null;
}

export default function RecipeIngredientsList({ ingredients }: RecipeIngredientsListProps) {
    if (!ingredients || ingredients.length === 0) {
        return (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 text-center">
                <p className="text-slate-400">No ingredients specified for this recipe.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Ingredients</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {ingredients.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-4 hover:border-pink-500/50 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-100 text-lg">
                                    {item.ingredient?.name || "Unknown Ingredient"}
                                </h3>
                                {item.quantity && (
                                    <p className="text-sm text-slate-400 mt-1">
                                        <span className="text-pink-400 font-semibold">{item.quantity}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
