import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const commentId = Number(id);

        if (!Number.isInteger(commentId)) {
            return getErrorMessage("Validation Error", "Invalid comment id", 400, "Bad Request");
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
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

        if (!comment) {
            return getErrorMessage("Not Found", "Comment not found", 404, "Not Found");
        }

        return getSuccessMessage("Comment retrieved successfully", comment, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const commentId = Number(id);

        if (!Number.isInteger(commentId)) {
            return getErrorMessage("Validation Error", "Invalid comment id", 400, "Bad Request");
        }

        const body = await req.json();
        const { comment } = body as { comment?: string };
        const normalizedComment = comment?.trim();

        if (!normalizedComment) {
            return getErrorMessage("Validation Error", "Comment is required", 400, "Bad Request");
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { comment: normalizedComment },
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

        return getSuccessMessage("Comment updated successfully", updatedComment, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const commentId = Number(id);

        if (!Number.isInteger(commentId)) {
            return getErrorMessage("Validation Error", "Invalid comment id", 400, "Bad Request");
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        return getSuccessMessage("Comment deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
