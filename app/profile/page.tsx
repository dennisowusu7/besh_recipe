"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FiEdit2, FiArrowLeft, FiLogOut, FiHeart, FiMessageCircle, FiStar } from "react-icons/fi";
import  PageLoading  from "../components/PageLoading";
import { UserProfile, Recipe } from "@/lib/interfaces";


export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        profileImage: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    
    useEffect(() => {
        if (!session?.user?.email) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/users?email=${encodeURIComponent(session.user?.email ?? "")}`);

                if (!response.ok) {
                    toast.error("Failed to load profile");
                    return;
                }

                const data = await response.json();
                const user = data.data;

                setUserProfile(user);
                setFormData({
                    name: user.name,
                    profileImage: user.profileImage || "",
                });

                
                const recipesRes = await fetch(`/api/recipes?userId=${user.id}`);
                if (recipesRes.ok) {
                    const recipesData = await recipesRes.json();
                    setUserRecipes(recipesData.data || []);
                }

               
                const savedRes = await fetch(`/api/saved-recipes?userId=${user.id}`);
                if (savedRes.ok) {
                    const savedData = await savedRes.json();
                    setSavedRecipes(savedData.data || []);
                }
            } catch (err) {
                toast.error("Error loading profile data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.email]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = formData.profileImage;

           
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadRes.ok) {
                    toast.error("Failed to upload image");
                    setSubmitting(false);
                    return;
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.data?.url || formData.profileImage;
            }

            const res = await fetch(`/api/users/${userProfile?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    profileImage: imageUrl,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(errData.err || "Failed to update profile");
                setSubmitting(false);
                return;
            }

            const updatedData = await res.json();
            setUserProfile(updatedData.data);
            setEditMode(false);
            setImageFile(null);
            setImagePreview(null);
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error("Error updating profile");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (status === "loading" || loading) {
        return <PageLoading />;
    }

    if (!userProfile) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
                <div className="text-center text-slate-400">Failed to load profile</div>
            </main>
        );
    }

    const stats = [
        {
            label: "Recipes",
            value: userProfile._count?.recipes || 0,
            icon: FiEdit2,
            color: "from-blue-500 to-cyan-500",
        },
        {
            label: "Saved",
            value: userProfile._count?.savedRecipes || 0,
            icon: FiHeart,
            color: "from-rose-500 to-pink-500",
        },
        {
            label: "Comments",
            value: userProfile._count?.comments || 0,
            icon: FiMessageCircle,
            color: "from-purple-500 to-violet-500",
        },
        {
            label: "Ratings",
            value: userProfile._count?.ratings || 0,
            icon: FiStar,
            color: "from-yellow-400 to-amber-400",
        },
    ];

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
            </div>

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition"
                    >
                        <FiArrowLeft size={20} />
                        Back
                    </Link>
                </div>

                
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8 mb-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="flex gap-6 items-center">
                            {/* Avatar */}
                            <div className="relative">
                                <Image
                                    src={imagePreview || userProfile.profileImage || "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=400&fit=crop"}
                                    alt={userProfile.name}
                                    width={120}
                                    height={120}
                                    unoptimized
                                    className="rounded-full border-2 border-slate-600 object-cover"
                                />
                            </div>

                            
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{userProfile.name}</h1>
                                <p className="text-slate-400 mb-2">{userProfile.email}</p>
                                <p className="text-sm text-slate-500">
                                    Member since{" "}
                                    {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                    })}
                                </p>
                            </div>
                        </div>

                        
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition"
                        >
                            <FiEdit2 size={20} />
                            {editMode ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>

                    
                    {editMode && (
                        <form onSubmit={handleSubmitProfile} className="mt-8 pt-8 border-t border-slate-700/50 space-y-6">
                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-300 focus:outline-none focus:border-cyan-500"
                                />
                                {imagePreview && (
                                    <p className="text-sm text-slate-400 mt-2">Image preview updated</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-6 cursor-pointer py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    )}
                </div>

                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {stats.map((stat, idx) => {
                        const IconComponent = stat.icon;
                        return (
                            <div
                                key={idx}
                                className="rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-400 text-sm">{stat.label}</p>
                                    <IconComponent
                                        size={20}
                                        className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                    />
                                </div>
                                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                
                <div className="space-y-8">
                    
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">My Recipes ({userRecipes.length})</h2>
                        {userRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userRecipes.map((recipe) => (
                                    <Link
                                        key={recipe.id}
                                        href={`/recipes/${recipe.id}`}
                                        className="group rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm overflow-hidden hover:border-cyan-500/50 transition"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={recipe.imageUrl}
                                                alt={recipe.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                                    {recipe.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-100 mb-2 line-clamp-2 group-hover:text-cyan-400 transition">
                                                {recipe.title}
                                            </h3>
                                            <div className="flex gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <FiMessageCircle size={14} />
                                                    {recipe._count?.comments || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiStar size={14} />
                                                    {recipe._count?.ratings || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiHeart size={14} />
                                                    {recipe._count?.savedRecipes || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-12 text-center">
                                <p className="text-slate-400 mb-4">You haven't created any recipes yet</p>
                                <Link
                                    href="/recipes/add"
                                    className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition"
                                >
                                    Create Your First Recipe
                                </Link>
                            </div>
                        )}
                    </section>

                    
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Saved Recipes ({savedRecipes.length})</h2>
                        {savedRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedRecipes.map((recipe) => (
                                    <Link
                                        key={recipe.id}
                                        href={`/recipes/${recipe.id}`}
                                        className="group rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm overflow-hidden hover:border-rose-500/50 transition"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={recipe.imageUrl}
                                                alt={recipe.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                                                    Saved
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-100 mb-2 line-clamp-2 group-hover:text-rose-400 transition">
                                                {recipe.title}
                                            </h3>
                                            <div className="flex gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <FiMessageCircle size={14} />
                                                    {recipe._count?.comments || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiStar size={14} />
                                                    {recipe._count?.ratings || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiHeart size={14} />
                                                    {recipe._count?.savedRecipes || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-12 text-center">
                                <p className="text-slate-400 mb-4">You haven't saved any recipes yet</p>
                                <Link
                                    href="/recipes"
                                    className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition"
                                >
                                    Explore Recipes
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
