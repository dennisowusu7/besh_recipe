import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

export const GET = async (req: Request) => {
    try {
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

        const comments = await prisma.comment.findMany({
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
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return getSuccessMessage("Comments retrieved successfully", comments, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { userId, recipeId, comment } = body as {
            userId?: number;
            recipeId?: number;
            comment?: string;
        };

        if (!userId || !recipeId || !comment) {
            return getErrorMessage("Validation Error", "userId, recipeId and comment are required", 400, "Bad Request");
        }
        if (!Number.isInteger(userId) || !Number.isInteger(recipeId)) {
            return getErrorMessage("Validation Error", "Invalid userId or recipeId", 400, "Bad Request");
        }

        const normalizedComment = comment.trim();
        if (!normalizedComment) {
            return getErrorMessage("Validation Error", "Comment cannot be empty", 400, "Bad Request");
        }

        const createdComment = await prisma.comment.create({
            data: {
                userId,
                recipeId,
                comment: normalizedComment,
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
                    },
                },
            },
        });

        return getSuccessMessage("Comment created successfully", createdComment, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
