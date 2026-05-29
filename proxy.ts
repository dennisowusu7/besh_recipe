import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const proxy = async (req: NextRequest) => {
    const session = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = "/recipes";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/ingredients", "/recipes/add", "/recipes/edit/:path*", "/profile"],
};