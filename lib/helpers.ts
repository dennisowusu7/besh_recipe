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
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/recipes`, {
        next: { revalidate: 5 },
    });
    if (!res.ok) {
        return [];
    }
    const payload = await res.json();
    const recipes = Array.isArray(payload?.data) ? payload.data : [];

    if (typeof count === "number" && count > 0) {
        return recipes.slice(0, count);
    }

    return recipes;
};

export const getRecipeById = async (id: string) => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/recipes/${id}`, {
        next: { revalidate: 5 },
    });

    if (!res.ok) {
        return null;
    }

    const payload = await res.json();
    return payload?.data ?? null;
};
