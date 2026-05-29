import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const recipeId = Number(id);

        if (!Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipe id", 400, "Bad Request");
        }

        // Delete all recipe-ingredients for this recipe
        const result = await prisma.recipeIngredient.deleteMany({
            where: { recipeId },
        });

        return getSuccessMessage(
            `Deleted ${result.count} ingredients from recipe`,
            { deletedCount: result.count },
            200,
            "OK"
        );
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
