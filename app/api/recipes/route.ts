import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";
import { UploadApiResponse, v2 } from "cloudinary";

type Difficulty = "Easy" | "Medium" | "Hard";

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

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);

        const userIdParam = searchParams.get("userId");
        const categoryIdParam = searchParams.get("categoryId");
        const difficulty = searchParams.get("difficulty") as Difficulty | null;
        const cuisine = searchParams.get("cuisine")?.trim();
        const search = searchParams.get("search")?.trim();

        const userId = userIdParam ? Number(userIdParam) : undefined;
        const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

        if (userIdParam && !Number.isInteger(userId)) {
            return getErrorMessage("Validation Error", "Invalid userId", 400, "Bad Request");
        }
        if (categoryIdParam && !Number.isInteger(categoryId)) {
            return getErrorMessage("Validation Error", "Invalid categoryId", 400, "Bad Request");
        }
        if (difficulty && !["Easy", "Medium", "Hard"].includes(difficulty)) {
            return getErrorMessage("Validation Error", "Invalid difficulty", 400, "Bad Request");
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                ...(userId !== undefined ? { userId } : {}),
                ...(categoryId !== undefined ? { categoryId } : {}),
                ...(difficulty ? { difficulty } : {}),
                ...(cuisine ? { cuisine: { equals: cuisine, mode: "insensitive" } } : {}),
                ...(search
                    ? {
                          OR: [
                              { title: { contains: search, mode: "insensitive" } },
                              { description: { contains: search, mode: "insensitive" } },
                              { ingredients: { some: { ingredient: { name: { contains: search, mode: "insensitive" } } } } },
                          ],
                      }
                    : {}),
            },
            select: {
                id: true,
                title: true,
                description: true,
                preparationSteps: true,
                cookingTime: true,
                difficulty: true,
                cuisine: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { id: true, name: true, profileImage: true } },
                category: { select: { id: true, name: true } },
                ingredients: {
                    select: {
                        id: true,
                        quantity: true,
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
            orderBy: { createdAt: "desc" },
        });

        return getSuccessMessage("Recipes retrieved successfully", recipes, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        const contentType = req.headers.get("content-type") || "";
        let userId: number | undefined;
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
            const rawData = formData.get("recipeData");
            const parsed = JSON.parse(String(rawData ?? "{}")) as {
                userId?: number;
                categoryId?: number | null;
                title?: string;
                description?: string | null;
                preparationSteps?: string;
                cookingTime?: number | null;
                difficulty?: Difficulty;
                cuisine?: string | null;
            };

            userId = parsed.userId;
            categoryId = parsed.categoryId;
            title = parsed.title;
            description = parsed.description;
            preparationSteps = parsed.preparationSteps;
            cookingTime = parsed.cookingTime;
            difficulty = parsed.difficulty;
            cuisine = parsed.cuisine;

            const file = formData.get("image") as Blob | null;
            if (file) {
                const uploadedFile = await uploadImage(file);
                imageUrl = uploadedFile?.url ?? null;
            } else {
                imageUrl = null;
            }
        } else {
            const body = await req.json();
            const parsed = body as {
                userId?: number;
                categoryId?: number | null;
                title?: string;
                description?: string | null;
                preparationSteps?: string;
                cookingTime?: number | null;
                difficulty?: Difficulty;
                cuisine?: string | null;
                imageUrl?: string | null;
            };

            userId = parsed.userId;
            categoryId = parsed.categoryId;
            title = parsed.title;
            description = parsed.description;
            preparationSteps = parsed.preparationSteps;
            cookingTime = parsed.cookingTime;
            difficulty = parsed.difficulty;
            cuisine = parsed.cuisine;
            imageUrl = parsed.imageUrl;
        }

        if (!userId || !title || !preparationSteps) {
            return getErrorMessage("Validation Error", "userId, title and preparationSteps are required", 400, "Bad Request");
        }
        if (!Number.isInteger(userId)) {
            return getErrorMessage("Validation Error", "Invalid userId", 400, "Bad Request");
        }
        if (categoryId !== undefined && categoryId !== null && !Number.isInteger(categoryId)) {
            return getErrorMessage("Validation Error", "Invalid categoryId", 400, "Bad Request");
        }
        if (difficulty && !["Easy", "Medium", "Hard"].includes(difficulty)) {
            return getErrorMessage("Validation Error", "Invalid difficulty", 400, "Bad Request");
        }

        const createdRecipe = await prisma.recipe.create({
            data: {
                userId,
                categoryId: categoryId ?? null,
                title: title.trim(),
                description: description?.trim() || null,
                preparationSteps: preparationSteps.trim(),
                cookingTime: cookingTime ?? null,
                difficulty: difficulty ?? "Easy",
                cuisine: cuisine?.trim() || null,
                imageUrl: imageUrl?.trim() || null,
            },
            select: {
                id: true,
                userId: true,
                categoryId: true,
                title: true,
                description: true,
                preparationSteps: true,
                cookingTime: true,
                difficulty: true,
                cuisine: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return getSuccessMessage("Recipe created successfully", createdRecipe, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
