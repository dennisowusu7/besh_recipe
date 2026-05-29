import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_req: Request, { params }: Params) => {
    try {
        const { id } = await params;
        const ingredientId = Number(id);

        if (!Number.isInteger(ingredientId)) {
            return getErrorMessage("Validation Error", "Invalid ingredient id", 400, "Bad Request");
        }

        const ingredient = await prisma.ingredient.findUnique({
            where: { id: ingredientId },
            select: {
                id: true,
                name: true,
                createdAt: true,
                recipes: {
                    select: {
                        id: true,
                        recipeId: true,
                        quantity: true,
                        recipe: {
                            select: {
                                id: true,
                                title: true,
                                difficulty: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        recipes: true,
                    },
                },
            },
        });

        if (!ingredient) {
            return getErrorMessage("Not Found", "Ingredient not found", 404, "Not Found");
        }

        return getSuccessMessage("Ingredient retrieved successfully", ingredient, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const ingredientId = Number(id);

        if (!Number.isInteger(ingredientId)) {
            return getErrorMessage("Validation Error", "Invalid ingredient id", 400, "Bad Request");
        }

        const body = await req.json();
        const { name } = body as { name?: string };
        const normalizedName = name?.trim();

        if (!normalizedName) {
            return getErrorMessage("Validation Error", "Ingredient name is required", 400, "Bad Request");
        }

        const updatedIngredient = await prisma.ingredient.update({
            where: { id: ingredientId },
            data: { name: normalizedName },
            select: {
                id: true,
                name: true,
                createdAt: true,
                _count: {
                    select: {
                        recipes: true,
                    },
                },
            },
        });

        return getSuccessMessage("Ingredient updated successfully", updatedIngredient, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const ingredientId = Number(id);

        if (!Number.isInteger(ingredientId)) {
            return getErrorMessage("Validation Error", "Invalid ingredient id", 400, "Bad Request");
        }

        await prisma.ingredient.delete({
            where: { id: ingredientId },
        });

        return getSuccessMessage("Ingredient deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
