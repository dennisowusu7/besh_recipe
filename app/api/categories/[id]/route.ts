import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const categoryId = Number(id);

        if (!Number.isInteger(categoryId)) {
            return getErrorMessage("Validation Error", "Invalid category id", 400, "Bad Request");
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                recipes: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        imageUrl: true,
                    },
                },
                _count: {
                    select: {
                        recipes: true,
                    },
                },
            },
        });

        if (!category) {
            return getErrorMessage("Not Found", "Category not found", 404, "Not Found");
        }

        return getSuccessMessage("Category retrieved successfully", category, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const categoryId = Number(id);

        if (!Number.isInteger(categoryId)) {
            return getErrorMessage("Validation Error", "Invalid category id", 400, "Bad Request");
        }

        const body = await req.json();
        const { name, description } = body as {
            name?: string;
            description?: string | null;
        };

        const data: { name?: string; description?: string | null } = {};
        if (name !== undefined) {
            const normalizedName = name.trim();
            if (!normalizedName) {
                return getErrorMessage("Validation Error", "Category name cannot be empty", 400, "Bad Request");
            }
            data.name = normalizedName;
        }
        if (description !== undefined) {
            data.description = description?.trim() || null;
        }

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                _count: {
                    select: {
                        recipes: true,
                    },
                },
            },
        });

        return getSuccessMessage("Category updated successfully", updatedCategory, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const categoryId = Number(id);

        if (!Number.isInteger(categoryId)) {
            return getErrorMessage("Validation Error", "Invalid category id", 400, "Bad Request");
        }

        await prisma.category.delete({
            where: { id: categoryId },
        });

        return getSuccessMessage("Category deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
