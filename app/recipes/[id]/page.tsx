import { getRecipeById } from "@/lib/helpers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeOwnerActions from "./RecipeOwnerActions";
import SaveRecipeButton from "./SaveRecipeButton";
import CommentsSection from "./CommentsSection";
import RatingsSection from "./RatingsSection";
import NutritionSection from "./NutritionSection";
import { RecipeDetails, RecipesPageProps } from "@/lib/types";
import { FiArrowLeft } from "react-icons/fi";

const fallbackImage =
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80";

const difficultyClass: Record<string, string> = {
    Easy: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    Hard: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
};

const preparationStepsStyle = `
    .preparation-content h1 { font-size: 1.875rem; font-weight: bold; margin: 1rem 0 0.5rem 0; color: rgb(226, 232, 240); }
    .preparation-content h2 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem 0; color: rgb(226, 232, 240); }
    .preparation-content h3 { font-size: 1.25rem; font-weight: bold; margin: 0.75rem 0 0.5rem 0; color: rgb(226, 232, 240); }
    .preparation-content p { margin-bottom: 1rem; color: rgb(203, 213, 225); line-height: 1.75; }
    .preparation-content ul, .preparation-content ol { margin-left: 1.5rem; margin-bottom: 1rem; }
    .preparation-content li { margin-bottom: 0.5rem; color: rgb(203, 213, 225); }
    .preparation-content strong { font-weight: 600; color: rgb(248, 113, 113); }
    .preparation-content em { font-style: italic; color: rgb(226, 232, 240); }
    .preparation-content img { max-width: 100%; height: auto; margin: 1rem 0; border-radius: 0.5rem; border: 1px solid rgb(71, 85, 105); }
    .preparation-content a { color: rgb(196, 181, 253); text-decoration: underline; }
    .preparation-content a:hover { color: rgb(217, 70, 239); }
`;

export default async function RecipeDetailsPage({ params }: RecipesPageProps) {
    const { id } = await params;
    const recipe = (await getRecipeById(id)) as RecipeDetails | null;

    if (!recipe) {
        notFound();
    }

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            <style>{preparationStepsStyle}</style>

            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
            </div>

            <div className="relative mx-auto max-w-6xl">
                <Link href="/recipes" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors mb-8">
                    <FiArrowLeft size={18} />
                    <span className="font-semibold">Back to recipes</span>
                </Link>

                <section className="mb-8 overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <div className="relative overflow-hidden h-80 md:h-96">
                        <Image
                            src={recipe.imageUrl || fallbackImage}
                            alt={recipe.title}
                            width={1400}
                            height={900}
                            unoptimized
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>
                    <div className="p-8 md:p-10">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${difficultyClass[recipe.difficulty]}`}>
                                {recipe.difficulty}
                            </span>
                            <span className="rounded-full bg-slate-700/50 border border-slate-600/50 px-4 py-2 text-sm text-slate-300">
                                {recipe.cuisine || "General Cuisine"}
                            </span>
                            <span className="rounded-full bg-slate-700/50 border border-slate-600/50 px-4 py-2 text-sm text-slate-300">
                                {recipe.cookingTime ? `${recipe.cookingTime} mins` : "Flexible Time"}
                            </span>
                            {recipe.category && (
                                <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-4 py-2 text-sm text-pink-300">
                                    {recipe.category.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">{recipe.title}</h1>
                        <p className="text-lg text-slate-400 mb-6 max-w-3xl">{recipe.description || "No description provided for this recipe."}</p>

                        <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-6">
                            <span>By <span className="text-slate-300 font-semibold">{recipe.user?.name || "Recipe Author"}</span></span>
                            <span>💬 {recipe._count?.comments ?? 0} comments</span>
                            <span>⭐ {recipe._count?.ratings ?? 0} ratings</span>
                            <span>❤️ {recipe._count?.savedRecipes ?? 0} saves</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <SaveRecipeButton recipeId={recipe.id} initialSaveCount={recipe._count?.savedRecipes ?? 0} />
                            {recipe.user?.id ? <RecipeOwnerActions recipeId={recipe.id} ownerId={recipe.user.id} /> : null}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3 mb-12">

                    <article className="lg:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
                        <h2 className="text-2xl font-bold text-slate-100 mb-6">Preparation Steps</h2>
                        <div 
                            className="preparation-content text-slate-300 text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: recipe.preparationSteps }}
                        />
                    </article>

                    <article className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
                        <h2 className="text-2xl font-bold text-slate-100 mb-6">Ingredients</h2>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            <ul className="space-y-3">
                                {recipe.ingredients.map((item) => (
                                    <li key={item.id} className="rounded-lg bg-slate-700/40 border border-slate-600/50 px-4 py-3">
                                        <span className="font-semibold text-slate-200">{item.ingredient?.name || "Unknown ingredient"}</span>
                                        {item.quantity ? <span className="text-slate-400"> - {item.quantity}</span> : null}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-400">No ingredients listed yet.</p>
                        )}
                    </article>
                </section>

                <NutritionSection recipeTitle={recipe.title} servings={4} />

                
                <section className="grid gap-6 lg:grid-cols-2 mb-12">
                    <RatingsSection recipeId={recipe.id} initialCount={recipe._count?.ratings ?? 0} />
                    <CommentsSection recipeId={recipe.id} initialCount={recipe._count?.comments ?? 0} />
                </section>
            </div>
        </main>
    );
}
