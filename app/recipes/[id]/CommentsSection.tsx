"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiSend, FiTrash2 } from "react-icons/fi";
import { Comment, CommentsSectionProps } from "@/lib/interfaces";

export default function CommentsSection({ recipeId, initialCount = 0 }: CommentsSectionProps) {
    const { data: session, status } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const user = session?.user as { id?: string; role?: "USER" | "ADMIN" } | undefined;
    const userId = user?.id ? Number(user.id) : undefined;

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/comments?recipeId=${recipeId}`, { cache: "no-store" });
                const data = await res.json();
                if (res.ok) {
                    setComments(Array.isArray(data?.data) ? data.data : []);
                }
            } catch {
                toast.error("Failed to load comments");
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [recipeId]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !userId) {
            toast.error("Please write a comment");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, recipeId, comment: newComment.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.err || "Failed to post comment");
                return;
            }

            setComments([data.data, ...comments]);
            setNewComment("");
            toast.success("Comment posted!");
        } catch {
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Delete this comment?")) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
            if (!res.ok) {
                toast.error("Failed to delete comment");
                return;
            }

            setComments(comments.filter((c) => c.id !== commentId));
            toast.success("Comment deleted");
        } catch {
            toast.error("Failed to delete comment");
        }
    };

    return (
        <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Comments</h2>
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent text-2xl font-bold">{comments.length}</span>
            </div>

            {status === "authenticated" && (
                <form onSubmit={handleSubmitComment} className="mb-8">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts on this recipe..."
                        rows={3}
                        className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50 resize-none"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        <FiSend size={16} />
                        Post Comment
                    </button>
                </form>
            )}

            {status !== "authenticated" && (
                <p className="mb-8 text-slate-400 text-sm">Sign in to leave a comment</p>
            )}

            {loading && <p className="text-slate-400">Loading comments...</p>}

            {!loading && comments.length === 0 && (
                <p className="text-slate-400">No comments yet. Be the first to comment!</p>
            )}

            {!loading && comments.length > 0 && (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="rounded-lg border border-slate-600/30 bg-slate-700/20 p-4"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                    {comment.user.profileImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={comment.user.profileImage}
                                            alt={comment.user.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-slate-100">{comment.user.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {userId === comment.userId && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-slate-400 hover:text-rose-400 transition-colors"
                                        title="Delete comment"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-300">{comment.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
