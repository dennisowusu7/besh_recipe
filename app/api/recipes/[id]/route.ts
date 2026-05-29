import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UploadApiResponse, v2 } from "cloudinary";

type Difficulty = "Easy" | "Medium" | "Hard";

type Params = {
    params: Promise<{ id: string }>;
};

async function uploadImage(file: Blob): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>(async (resolve, reject) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        v2.uploader
            .upload_stream({ resource_type: "auto", folder: "besh-recipes" }, (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result);
                return reject(new Error("No upload result"));
            })
            .end(buffer);
    });
}

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const recipeId = Number(id);

        if (!Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipe id", 400, "Bad Request");
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                category: { select: { id: true, name: true } },
                ingredients: {
                    include: {
                        ingredient: { select: { id: true, name: true } },
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        ratings: true,
                        savedRecipes: true,
                    },
                },
            },
        });

        if (!recipe) {
            return getErrorMessage("Not Found", "Recipe not found", 404, "Not Found");
        }

        return getSuccessMessage("Recipe retrieved successfully", recipe, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const session = await getServerSession(authOptions);
        const currentUser = session?.user as { id?: string; role?: "USER" | "ADMIN" } | undefined;
        if (!currentUser?.id) {
            return getErrorMessage("Unauthorized", "Please sign in", 401, "Unauthorized");
        }

        const { id } = await params;
        const recipeId = Number(id);

        if (!Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipe id", 400, "Bad Request");
        }

        const contentType = req.headers.get("content-type") || "";
        let categoryId: number | null | undefined;
        let title: string | undefined;
        let description: string | null | undefined;
        let preparationSteps: string | undefined;
        let cookingTime: number | null | undefined;
        let difficulty: Difficulty | undefined;
        let cuisine: string | null | undefined;
        let imageUrl: string | null | undefined;

        if (contentType.includes("multipart/form-data")) {
            v2.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            const formData = await req.formData();
            const parsed = JSON.parse(String(formData.get("recipeData") ?? "{}")) as {
                categoryId?: number | null;
                title?: string;
                description?: string | null;
                preparationSteps?: string;
                cookingTime?: number | null;
                difficulty?: Difficulty;
                cuisine?: string | null;
            };
            categoryId = parsed.categoryId;
            title = parsed.title;
            description = parsed.description;
            preparationSteps = parsed.preparationSteps;
            cookingTime = parsed.cookingTime;
            difficulty = parsed.difficulty;
            cuisine = parsed.cuisine;

            const file = formData.get("image") as Blob | null;
            if (file) {
                const uploaded = await uploadImage(file);
                imageUrl = uploaded?.url ?? null;
            }
        } else {
            const body = await req.json();
            const parsed = body as {
                categoryId?: number | null;
                title?: string;
                description?: string | null;
                preparationSteps?: string;
                cookingTime?: number | null;
                difficulty?: Difficulty;
                cuisine?: string | null;
                imageUrl?: string | null;
            };
            categoryId = parsed.categoryId;
            title = parsed.title;
            description = parsed.description;
            preparationSteps = parsed.preparationSteps;
            cookingTime = parsed.cookingTime;
            difficulty = parsed.difficulty;
            cuisine = parsed.cuisine;
            imageUrl = parsed.imageUrl;
        }

        if (categoryId !== undefined && categoryId !== null && !Number.isInteger(categoryId)) {
            return getErrorMessage("Validation Error", "Invalid categoryId", 400, "Bad Request");
        }
        if (difficulty && !["Easy", "Medium", "Hard"].includes(difficulty)) {
            return getErrorMessage("Validation Error", "Invalid difficulty", 400, "Bad Request");
        }

        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true, userId: true },
        });
        if (!existingRecipe) {
            return getErrorMessage("Not Found", "Recipe not found", 404, "Not Found");
        }

        const isAdmin = currentUser.role === "ADMIN";
        const isOwner = existingRecipe.userId === Number(currentUser.id);
        if (!isAdmin && !isOwner) {
            return getErrorMessage("Forbidden", "You can only edit your own recipe", 403, "Forbidden");
        }

        const data: {
            categoryId?: number | null;
            title?: string;
            description?: string | null;
            preparationSteps?: string;
            cookingTime?: number | null;
            difficulty?: Difficulty;
            cuisine?: string | null;
            imageUrl?: string | null;
        } = {};

        if (categoryId !== undefined) data.categoryId = categoryId;
        if (title !== undefined) data.title = title.trim();
        if (description !== undefined) data.description = description?.trim() || null;
        if (preparationSteps !== undefined) data.preparationSteps = preparationSteps.trim();
        if (cookingTime !== undefined) data.cookingTime = cookingTime;
        if (difficulty !== undefined) data.difficulty = difficulty;
        if (cuisine !== undefined) data.cuisine = cuisine?.trim() || null;
        if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() || null;

        const updatedRecipe = await prisma.recipe.update({
            where: { id: recipeId },
            data,
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                category: { select: { id: true, name: true } },
                _count: {
                    select: {
                        comments: true,
                        ratings: true,
                        savedRecipes: true,
                    },
                },
            },
        });

        return getSuccessMessage("Recipe updated successfully", updatedRecipe, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const session = await getServerSession(authOptions);
        const currentUser = session?.user as { id?: string; role?: "USER" | "ADMIN" } | undefined;
        if (!currentUser?.id) {
            return getErrorMessage("Unauthorized", "Please sign in", 401, "Unauthorized");
        }

        const { id } = await params;
        const recipeId = Number(id);

        if (!Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipe id", 400, "Bad Request");
        }

        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true, userId: true },
        });
        if (!existingRecipe) {
            return getErrorMessage("Not Found", "Recipe not found", 404, "Not Found");
        }

        const isAdmin = currentUser.role === "ADMIN";
        const isOwner = existingRecipe.userId === Number(currentUser.id);
        if (!isAdmin && !isOwner) {
            return getErrorMessage("Forbidden", "You can only delete your own recipe", 403, "Forbidden");
        }

        await prisma.recipe.delete({
            where: { id: recipeId },
        });

        return getSuccessMessage("Recipe deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
