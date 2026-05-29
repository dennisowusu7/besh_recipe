import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

const isValidRating = (value: number) => Number.isInteger(value) && value >= 1 && value <= 5;

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const ratingId = Number(id);

        if (!Number.isInteger(ratingId)) {
            return getErrorMessage("Validation Error", "Invalid rating id", 400, "Bad Request");
        }

        const rating = await prisma.rating.findUnique({
            where: { id: ratingId },
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
                        imageUrl: true,
                    },
                },
            },
        });

        if (!rating) {
            return getErrorMessage("Not Found", "Rating not found", 404, "Not Found");
        }

        return getSuccessMessage("Rating retrieved successfully", rating, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const ratingId = Number(id);

        if (!Number.isInteger(ratingId)) {
            return getErrorMessage("Validation Error", "Invalid rating id", 400, "Bad Request");
        }

        const body = await req.json();
        const { rating } = body as { rating?: number };

        if (rating === undefined || !isValidRating(rating)) {
            return getErrorMessage("Validation Error", "Rating must be an integer between 1 and 5", 400, "Bad Request");
        }

        const updatedRating = await prisma.rating.update({
            where: { id: ratingId },
            data: { rating },
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
                        imageUrl: true,
                    },
                },
            },
        });

        return getSuccessMessage("Rating updated successfully", updatedRating, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const ratingId = Number(id);

        if (!Number.isInteger(ratingId)) {
            return getErrorMessage("Validation Error", "Invalid rating id", 400, "Bad Request");
        }

        await prisma.rating.delete({
            where: { id: ratingId },
        });

        return getSuccessMessage("Rating deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
