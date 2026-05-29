"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiStar } from "react-icons/fi";
import { Rating, RatingsSectionProps } from "@/lib/interfaces";

export default function RatingsSection({ recipeId, initialCount = 0 }: RatingsSectionProps) {
    const { data: session, status } = useSession();
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const user = session?.user as { id?: string; role?: "USER" | "ADMIN" } | undefined;
    const userId = user?.id ? Number(user.id) : undefined;

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const res = await fetch(`/api/ratings?recipeId=${recipeId}`, { cache: "no-store" });
                const data = await res.json();
                if (res.ok) {
                    const ratingsList = Array.isArray(data?.data) ? data.data : [];
                    setRatings(ratingsList);
                    const userRatingObj = ratingsList.find((r:any) => r.userId === userId);
                    setUserRating(userRatingObj?.rating ?? null);
                }
            } catch {
                toast.error("Failed to load ratings");
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, [recipeId, userId]);

    const handleSubmitRating = async (rating: number) => {
        if (!userId) {
            toast.error("Sign in to rate this recipe");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, recipeId, rating }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.err || "Failed to submit rating");
                return;
            }

            setRatings([data.data, ...ratings.filter((r) => r.userId !== userId)]);
            setUserRating(rating);
            toast.success("Rating submitted!");
        } catch {
            toast.error("Failed to submit rating");
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate statistics
    const avgRating =
        ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0;

    const ratingCounts = {
        5: ratings.filter((r) => r.rating === 5).length,
        4: ratings.filter((r) => r.rating === 4).length,
        3: ratings.filter((r) => r.rating === 3).length,
        2: ratings.filter((r) => r.rating === 2).length,
        1: ratings.filter((r) => r.rating === 1).length,
    };

    return (
        <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Ratings</h2>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent text-2xl font-bold">{ratings.length}</span>
            </div>

            {/* Rating Summary */}
            <div className="mb-8 rounded-lg border border-slate-600/30 bg-slate-700/20 p-6">
                <div className="flex items-start gap-6 mb-6">
                    <div className="text-center">
                        <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                            {avgRating}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">{ratings.length} ratings</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-sm text-slate-400 w-8">{star}★</span>
                                <div className="flex-1 h-2 bg-slate-600/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all"
                                        style={{
                                            width: ratings.length > 0 ? `${(ratingCounts[star as keyof typeof ratingCounts] / ratings.length) * 100}%` : "0%",
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-slate-400 w-6">
                                    {ratingCounts[star as keyof typeof ratingCounts]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Rating Input */}
                {status === "authenticated" && (
                    <div className="border-t border-slate-600/30 pt-4">
                        <p className="text-sm text-slate-400 mb-3">
                            {userRating ? `You rated: ${userRating} ★` : "Rate this recipe:"}
                        </p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleSubmitRating(star)}
                                    disabled={submitting}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className="transition-transform hover:scale-110 disabled:opacity-50"
                                    title={`Rate ${star} stars`}
                                >
                                    <FiStar
                                        size={24}
                                        className={`transition-colors ${
                                            (hoverRating || userRating || 0) >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-slate-500"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {status !== "authenticated" && (
                    <p className="text-slate-400 text-sm border-t border-slate-600/30 pt-4">
                        Sign in to rate this recipe
                    </p>
                )}
            </div>

            {/* Recent Ratings */}
            {loading && <p className="text-slate-400">Loading ratings...</p>}

            {!loading && ratings.length === 0 && (
                <p className="text-slate-400">No ratings yet. Be the first to rate!</p>
            )}

            {!loading && ratings.length > 0 && (
                <div>
                    <p className="text-sm text-slate-400 mb-4">Recent ratings from community</p>
                    <div className="space-y-3">
                        {ratings.slice(0, 5).map((rating) => (
                            <div
                                key={rating.id}
                                className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-700/20 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    {rating.user.profileImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={rating.user.profileImage}
                                            alt={rating.user.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500" />
                                    )}
                                    <p className="text-sm font-semibold text-slate-100">{rating.user.name}</p>
                                </div>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <FiStar
                                            key={i}
                                            size={16}
                                            className={i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
