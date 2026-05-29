import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const savedRecipeId = Number(id);

        if (!Number.isInteger(savedRecipeId)) {
            return getErrorMessage("Validation Error", "Invalid saved recipe id", 400, "Bad Request");
        }

        const savedRecipe = await prisma.savedRecipe.findUnique({
            where: { id: savedRecipeId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                },
                recipe: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        imageUrl: true,
                        cuisine: true,
                    },
                },
            },
        });

        if (!savedRecipe) {
            return getErrorMessage("Not Found", "Saved recipe not found", 404, "Not Found");
        }

        return getSuccessMessage("Saved recipe retrieved successfully", savedRecipe, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const savedRecipeId = Number(id);

        if (!Number.isInteger(savedRecipeId)) {
            return getErrorMessage("Validation Error", "Invalid saved recipe id", 400, "Bad Request");
        }

        await prisma.savedRecipe.delete({
            where: { id: savedRecipeId },
        });

        return getSuccessMessage("Saved recipe deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
