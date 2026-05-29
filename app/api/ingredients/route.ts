import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name")?.trim();

        const ingredients = await prisma.ingredient.findMany({
            where: name ? { name: { contains: name, mode: "insensitive" } } : undefined,
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
            orderBy: { name: "asc" },
        });

        return getSuccessMessage("Ingredients retrieved successfully", ingredients, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { name } = body as { name?: string };
        const normalizedName = name?.trim();

        if (!normalizedName) {
            return getErrorMessage("Validation Error", "Ingredient name is required", 400, "Bad Request");
        }

        const existingIngredient = await prisma.ingredient.findUnique({
            where: { name: normalizedName },
        });

        if (existingIngredient) {
            return getErrorMessage("Validation Error", "Ingredient already exists", 409, "Conflict");
        }

        const newIngredient = await prisma.ingredient.create({
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

        return getSuccessMessage("Ingredient created successfully", newIngredient, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
