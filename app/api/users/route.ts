import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";
import prisma from "@/prisma";
import bcrypt from "bcrypt";

export const GET = async (req: Request) => {
    try {
        await ConnectToDB();
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const email = searchParams.get("email");

        if (email) {
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
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

            if (!user) {
                return getErrorMessage("User not found", null, 404, "Not Found");
            }

            return getSuccessMessage("User fetched successfully", user, 200, "OK");
        }

        const users = await prisma.user.findMany({
            where: role ? { role: role as "USER" | "ADMIN" } : undefined,
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

        return getSuccessMessage("Users fetched successfully", users, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};

export const POST = async (req: Request) => {
    try {
        await ConnectToDB();
        const body = await req.json();
        const { name, email, password, role, profileImage } = body as {
            name?: string;
            email?: string;
            password?: string;
            role?: "USER" | "ADMIN";
            profileImage?: string | null;
        };

        if (!name || !email || !password) {
            return getErrorMessage("name, email and password are required", null, 400, "Bad Request");
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return getErrorMessage("User already exists", null, 409, "Conflict");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role ?? "USER",
                profileImage: profileImage ?? null,
            },
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

        return getSuccessMessage("User created successfully", newUser, 201, "Created");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
