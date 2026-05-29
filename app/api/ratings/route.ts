import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

const isValidRating = (value: number) => Number.isInteger(value) && value >= 1 && value <= 5;

export const GET = async (req: Request) => {
    try {
        await ConnectToDB();
        const { searchParams } = new URL(req.url);
        const userIdParam = searchParams.get("userId");
        const recipeIdParam = searchParams.get("recipeId");

        const userId = userIdParam ? Number(userIdParam) : undefined;
        const recipeId = recipeIdParam ? Number(recipeIdParam) : undefined;

        if (userIdParam && !Number.isInteger(userId)) {
            return getErrorMessage("Validation Error", "Invalid userId", 400, "Bad Request");
        }
        if (recipeIdParam && !Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid recipeId", 400, "Bad Request");
        }

        const ratings = await prisma.rating.findMany({
            where: {
                ...(userId !== undefined ? { userId } : {}),
                ...(recipeId !== undefined ? { recipeId } : {}),
            },
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
            orderBy: { createdAt: "desc" },
        });

        return getSuccessMessage("Ratings retrieved successfully", ratings, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        await ConnectToDB();
        const body = await req.json();
        const { userId, recipeId, rating } = body as { userId?: number; recipeId?: number; rating?: number };

        if (!userId || !recipeId || rating === undefined) {
            return getErrorMessage("Validation Error", "userId, recipeId and rating are required", 400, "Bad Request");
        }
        if (!Number.isInteger(userId) || !Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid userId or recipeId", 400, "Bad Request");
        }
        if (!isValidRating(rating)) {
            return getErrorMessage("Validation Error", "Rating must be an integer between 1 and 5", 400, "Bad Request");
        }

        const existingRating = await prisma.rating.findUnique({
            where: {
                userId_recipeId: {
                    userId,
                    recipeId,
                },
            },
        });

        if (existingRating) {
            return getErrorMessage("Validation Error", "User already rated this recipe", 409, "Conflict");
        }

        const createdRating = await prisma.rating.create({
            data: {
                userId,
                recipeId,
                rating,
            },
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

        return getSuccessMessage("Rating created successfully", createdRating, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
