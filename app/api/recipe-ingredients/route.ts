import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const recipeIdParam = searchParams.get("recipeId");
        const ingredientIdParam = searchParams.get("ingredientId");

        const recipeId = recipeIdParam ? Number(recipeIdParam) : undefined;
        const ingredientId = ingredientIdParam ? Number(ingredientIdParam) : undefined;

        if (recipeIdParam && !Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipeId", 400, "Bad Request");
        }
        if (ingredientIdParam && !Number.isInteger(ingredientId)) {
            return getErrorMessage("Validation Error", "Invalid ingredientId", 400, "Bad Request");
        }

        const links = await prisma.recipeIngredient.findMany({
            where: {
                ...(recipeId !== undefined ? { recipeId } : {}),
                ...(ingredientId !== undefined ? { ingredientId } : {}),
            },
            include: {
                recipe: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        imageUrl: true,
                    },
                },
                ingredient: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { id: "desc" },
        });

        return getSuccessMessage("Recipe ingredients retrieved successfully", links, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { recipeId, ingredientId, quantity } = body as {
            recipeId?: number;
            ingredientId?: number;
            quantity?: string | null;
        };

        if (!recipeId || !ingredientId) {
            return getErrorMessage("Validation Error", "recipeId and ingredientId are required", 400, "Bad Request");
        }
        if (!Number.isInteger(recipeId) || !Number.isInteger(ingredientId)) {
            return getErrorMessage("Validation Error", "Invalid recipeId or ingredientId", 400, "Bad Request");
        }

        const createdLink = await prisma.recipeIngredient.create({
            data: {
                recipeId,
                ingredientId,
                quantity: quantity?.trim() || null,
            },
            include: {
                recipe: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                ingredient: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return getSuccessMessage("Recipe ingredient created successfully", createdLink, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
