import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const linkId = Number(id);

        if (!Number.isInteger(linkId)) {
            return getErrorMessage("Validation Error", "Invalid recipe-ingredient id", 400, "Bad Request");
        }

        const link = await prisma.recipeIngredient.findUnique({
            where: { id: linkId },
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
        });

        if (!link) {
            return getErrorMessage("Not Found", "Recipe ingredient not found", 404, "Not Found");
        }

        return getSuccessMessage("Recipe ingredient retrieved successfully", link, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const linkId = Number(id);

        if (!Number.isInteger(linkId)) {
            return getErrorMessage("Validation Error", "Invalid recipe-ingredient id", 400, "Bad Request");
        }

        const body = await req.json();
        const { recipeId, ingredientId, quantity } = body as {
            recipeId?: number;
            ingredientId?: number;
            quantity?: string | null;
        };

        if (recipeId !== undefined && !Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipeId", 400, "Bad Request");
        }
        if (ingredientId !== undefined && !Number.isInteger(ingredientId)) {
            return getErrorMessage("Validation Error", "Invalid ingredientId", 400, "Bad Request");
        }

        const data: {
            recipeId?: number;
            ingredientId?: number;
            quantity?: string | null;
        } = {};

        if (recipeId !== undefined) data.recipeId = recipeId;
        if (ingredientId !== undefined) data.ingredientId = ingredientId;
        if (quantity !== undefined) data.quantity = quantity?.trim() || null;

        const updatedLink = await prisma.recipeIngredient.update({
            where: { id: linkId },
            data,
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

        return getSuccessMessage("Recipe ingredient updated successfully", updatedLink, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const linkId = Number(id);

        if (!Number.isInteger(linkId)) {
            return getErrorMessage("Validation Error", "Invalid recipe-ingredient id", 400, "Bad Request");
        }

        await prisma.recipeIngredient.delete({
            where: { id: linkId },
        });

        return getSuccessMessage("Recipe ingredient deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
