import { getAllRecipes } from "@/lib/helpers";
import { HomeRecipe } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiStar } from "react-icons/fi";

const fallbackImage =
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80";

const difficultyClass: Record<HomeRecipe["difficulty"], string> = {
    Easy: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    Hard: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
};

const HomeSection = async () => {
    const recipes = (await getAllRecipes(7)) as HomeRecipe[];
    const [featured, ...latest] = recipes;

    return (
        <section className="relative mx-auto w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
            </div>

            <div className="relative mx-auto max-w-7xl">
                {/* Hero Section */}
                <div className="grid items-center gap-12 md:grid-cols-2 mb-16">
                    <div className="z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 backdrop-blur-sm mb-6">
                            <FiStar className="text-pink-400" size={16} />
                            <span className="text-sm font-semibold text-pink-300">Chef-Grade Home Cooking</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                                Cook Better Meals
                            </span>
                            <br />
                            <span className="text-slate-100">With Curated Recipes</span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                            Discover trusted recipes with clear prep steps, difficulty levels, and practical tips for busy kitchens. Join our community of home chefs.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/recipes"
                                className="group px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 flex items-center gap-2"
                            >
                                Explore Recipes
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/categories"
                                className="px-6 py-3 rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm text-slate-200 font-semibold transition-all duration-300 hover:border-slate-500 hover:bg-slate-700/50"
                            >
                                Browse Categories
                            </Link>
                        </div>
                    </div>

                    {/* Featured Recipe Image */}
                    {featured && (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/50 to-rose-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <Image
                                    src={featured?.imageUrl || fallbackImage}
                                    alt={featured?.title || "Featured recipe"}
                                    width={1200}
                                    height={900}
                                    unoptimized
                                    className="h-96 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Featured Recipe Details */}
                {featured && (
                    <article className="mb-16 rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-8 transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/40">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${difficultyClass[featured.difficulty]}`}>
                                {featured.difficulty}
                            </span>
                            <span className="rounded-full bg-slate-700/50 border border-slate-600/50 px-3 py-1.5 text-xs text-slate-300">
                                {featured.cuisine || "Global Cuisine"}
                            </span>
                            <span className="rounded-full bg-slate-700/50 border border-slate-600/50 px-3 py-1.5 text-xs text-slate-300">
                                {featured.cookingTime ? `${featured.cookingTime} mins` : "Flexible Time"}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">{featured.title}</h2>
                        <p className="text-slate-400 mb-6 max-w-3xl text-lg">
                            {featured.description || "A carefully crafted recipe ready for your next meal."}
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-6">
                            <span>By <span className="text-slate-300 font-semibold">{featured.user?.name || "Recipe Author"}</span></span>
                            <span>💬 {featured._count?.comments ?? 0} comments</span>
                            <span>⭐ {featured._count?.ratings ?? 0} ratings</span>
                            <span>❤️ {featured._count?.savedRecipes ?? 0} saves</span>
                        </div>
                        <Link
                            href={`/recipes/${featured.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                        >
                            View Full Recipe
                            <FiArrowRight />
                        </Link>
                    </article>
                )}

                {/* Latest Recipes Section */}
                <div className="mb-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">Latest Picks</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-100">
                                Fresh Recipes <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">From Community</span>
                            </h3>
                        </div>
                        <Link 
                            href="/recipes" 
                            className="text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
                        >
                            View all recipes <FiArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Recipe Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {latest.map((recipe, idx) => (
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
                                    <span className="text-xs text-slate-500">{recipe.cookingTime ? `${recipe.cookingTime} min` : "Anytime"}</span>
                                </div>
                                <h4 className="line-clamp-2 text-lg font-bold text-slate-100 mb-2 group-hover:text-pink-400 transition-colors">
                                    {recipe.title}
                                </h4>
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
                </div>
            </div>
        </section>
    );
};

export default HomeSection;
