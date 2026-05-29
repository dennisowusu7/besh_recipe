import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";

export const GET = async (req: Request) => {
    try {
        await ConnectToDB();
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name")?.trim();

        const categories = await prisma.category.findMany({
            where: name ? { name: { contains: name, mode: "insensitive" } } : undefined,
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
            orderBy: { createdAt: "desc" },
        });

        return getSuccessMessage("Categories retrieved successfully", categories, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        await ConnectToDB();
        const body = await req.json();
        const { name, description } = body as {
            name?: string;
            description?: string | null;
        };

        const normalizedName = name?.trim();
        if (!normalizedName) {
            return getErrorMessage("Validation Error", "Category name is required", 400, "Bad Request");
        }

        const existingCategory = await prisma.category.findUnique({
            where: { name: normalizedName },
        });

        if (existingCategory) {
            return getErrorMessage("Validation Error", "Category already exists", 409, "Conflict");
        }

        const newCategory = await prisma.category.create({
            data: {
                name: normalizedName,
                description: description?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
            },
        });

        return getSuccessMessage("Category created successfully", newCategory, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
