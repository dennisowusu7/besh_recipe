import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { DefaultUser } from "next-auth";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const ConnectToDB = async () =>{
    try{
        await prisma.$connect();
        console.log("Connected to DB");
    } catch (error) {
        console.error("Error connecting to DB:", error);
    }
};

export const getSuccessMessage = (message: string, data: unknown, status: number, statusText: string) => {
    return NextResponse.json({message, data}, {status, statusText});
};

export const getErrorMessage = (message: string, err: unknown, status: number, statusText: string) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({message, err: errorMessage}, {status, statusText});
};

export const verifyUserDetails = async (user: Partial<DefaultUser>) => {
    if (!user.email) return null;

    const isUserExists = await prisma.user.findUnique({
        where: {
            email: user.email,
        },
    });

    if (!isUserExists) {
        const oauthPlaceholderPassword = await bcrypt.hash(crypto.randomUUID(), 10);

        const newUser = await prisma.user.create({
            data: {
                name: user.name || "Unknown",
                email: user.email,
                password: oauthPlaceholderPassword,
                profileImage: user.image || null,
            },
        });
        return newUser;
    }

    return isUserExists;
};

export const getAllRecipes = async (count?: number) => {
    try {
        await ConnectToDB();
        const recipes = await prisma.recipe.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                preparationSteps: true,
                cookingTime: true,
                difficulty: true,
                cuisine: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { id: true, name: true, profileImage: true } },
                category: { select: { id: true, name: true } },
                ingredients: {
                    select: {
                        id: true,
                        quantity: true,
                        ingredient: { select: { id: true, name: true } },
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        ratings: true,
                        savedRecipes: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: typeof count === "number" && count > 0 ? count : undefined,
        });

        return recipes;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
};

export const getRecipeById = async (id: string) => {
    try {
        await ConnectToDB();
        const recipe = await prisma.recipe.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                title: true,
                description: true,
                preparationSteps: true,
                cookingTime: true,
                difficulty: true,
                cuisine: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { id: true, name: true, profileImage: true } },
                category: { select: { id: true, name: true } },
                ingredients: {
                    select: {
                        id: true,
                        quantity: true,
                        ingredient: { select: { id: true, name: true } },
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        ratings: true,
                        savedRecipes: true,
                    },
                },
            },
        });

        return recipe ?? null;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return null;
    }
};
