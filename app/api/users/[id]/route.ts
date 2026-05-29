import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";
import bcrypt from "bcrypt";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return getErrorMessage("Invalid user id", null, 400, "Bad Request");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return getErrorMessage("User not found", null, 404, "Not Found");
        }

        return getSuccessMessage("User fetched successfully", user, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PATCH = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return getErrorMessage("Invalid user id", null, 400, "Bad Request");
        }

        const body = await req.json();
        const { name, email, password, role, profileImage } = body as {
            name?: string;
            email?: string;
            password?: string;
            role?: "USER" | "ADMIN";
            profileImage?: string | null;
        };

        const data: {
            name?: string;
            email?: string;
            password?: string;
            role?: "USER" | "ADMIN";
            profileImage?: string | null;
        } = {};

        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (role !== undefined) data.role = role;
        if (profileImage !== undefined) data.profileImage = profileImage;
        if (password !== undefined) data.password = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return getSuccessMessage("User updated successfully", updatedUser, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const DELETE = async (_req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return getErrorMessage("Invalid user id", null, 400, "Bad Request");
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return getSuccessMessage("User deleted successfully", null, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const PUT = async (req: Request, { params }: Params) => {
    try {
        await ConnectToDB();
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return getErrorMessage("Invalid user id", null, 400, "Bad Request");
        }

        const body = await req.json();
        const { name, email, password, role, profileImage, isActive } = body as {
            name?: string;
            email?: string;
            password?: string;
            role?: "USER" | "ADMIN";
            profileImage?: string | null;
            isActive?: boolean;
        };

        const data: {
            name?: string;
            email?: string;
            password?: string;
            role?: "USER" | "ADMIN";
            profileImage?: string | null;
            isActive?: boolean;
        } = {};

        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (role !== undefined) data.role = role;
        if (profileImage !== undefined) data.profileImage = profileImage;
        if (isActive !== undefined) data.isActive = isActive;
        if (password !== undefined) data.password = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        recipes: true,
                        savedRecipes: true,
                        comments: true,
                        ratings: true,
                    },
                },
            },
        });

        return getSuccessMessage("User updated successfully", updatedUser, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
