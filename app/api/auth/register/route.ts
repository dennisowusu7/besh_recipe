import { ConnectToDB } from "@/lib/helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { RegisterBody } from "@/lib/types";



export const POST = async (req: Request) => {
    try {
        const body = (await req.json()) as RegisterBody;
        const { name, email, password, role, profileImage } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: "name, email and password are required" }, { status: 400 });
        }

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!trimmedName || !normalizedEmail || password.length < 6) {
            return NextResponse.json(
                { message: "Provide valid name/email and password with at least 6 characters" },
                { status: 400 }
            );
        }

        await ConnectToDB();
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: trimmedName,
                password: hashedPassword,
                role: role ?? "USER",
                profileImage: profileImage ?? null,
            },
        });

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return NextResponse.json(
            {
                message: "User successfully created",
                user: safeUser,
            },
            { status: 201 }
        );
    } catch (err: unknown) {
        console.error("Failed to create user", err);

        return NextResponse.json(
            {
                message: "Failed to create user",
            },
            { status: 500 }
        );
    }
};
