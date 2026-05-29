import { ConnectToDB } from "@/lib/helpers";
import prisma from "@/prisma";
import NextAuth, { AuthOptions } from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";

const baseAdapter = PrismaAdapter(prisma);

const toAdapterUser = (user: {
    id: number;
    name: string;
    email: string;
    profileImage: string | null;
}) => ({
    id: String(user.id),
    name: user.name,
    email: user.email,
    emailVerified: null,
    image: user.profileImage,
});

const adapter: Adapter = {
    ...baseAdapter,
    async createUser(data: Omit<AdapterUser, "id">) {
        const { image, emailVerified, ...rest } = data;
        const oauthPlaceholderPassword = await bcrypt.hash(crypto.randomUUID(), 10);
        const normalizedName = (rest.name ?? "Unknown").trim() || "Unknown";

        const createdUser = await prisma.user.create({
            data: {
                ...rest,
                name: normalizedName,
                password: oauthPlaceholderPassword,
                profileImage: image ?? null,
            },
        });

        return toAdapterUser(createdUser);
    },
    
    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
        const { id, image, emailVerified, ...rest } = data;
        const updateData: { name?: string; email?: string; profileImage?: string | null } = {};

        if (rest.email !== undefined) updateData.email = rest.email;
        if (rest.name !== undefined && rest.name !== null) {
            updateData.name = rest.name.trim() || "Unknown";
        }
        if (image !== undefined) updateData.profileImage = image;

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData,
        });

        return toAdapterUser(updatedUser);
    },

    async linkAccount(data: any) {
        return prisma.account.create({
            data: {
                ...data,
                userId: Number(data.userId),
            },
        });
    },
};

export const authOptions: AuthOptions = {
    
    adapter,

    session: {
        strategy: "jwt",
    },

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
        async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                // await ConnectToDB();

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user?.password) return null;

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) return null;

                // Check if account is active
                if (!user.isActive) {
                    throw new Error("ACCOUNT_INACTIVE");
                }

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),

        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    scope: "read:user user:email",
                },
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent select_account",
                },
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const authUser = user as typeof user & { id?: string | number; profileImage?: string | null; role?: "USER" | "ADMIN" };
                token.sub = authUser.id !== undefined ? String(authUser.id) : token.sub;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image ?? authUser.profileImage ?? null;
                token.role = authUser.role ?? token.role;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                const sessionUser = session.user as typeof session.user & { id?: string; role?: "USER" | "ADMIN" };
                sessionUser.id = token.sub ?? "";
                sessionUser.email = token.email;
                sessionUser.name = token.name;
                sessionUser.image = token.picture;
                sessionUser.role = (token.role as "USER" | "ADMIN" | undefined) ?? "USER";
            }
            return session;
        },

        async signIn({ user, account }) {
            if (!account) return false;

            // allow credentials always (it already checks isActive in authorize)
            if (account.provider === "credentials") return true;

            
            if (account.provider === "github" || account.provider === "google") {
                if (!user.email) {
                    return "/login?error=OAuthEmailMissing";
                }

                await ConnectToDB();

                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                    include: { accounts: true },
                });

                // Check if account is active
                if (existingUser && !existingUser.isActive) {
                    return "/login?error=AccountInactive";
                }

                // user does not exist so let's allow creation
                if (!existingUser) return true;

                // user exists so let's allow linking OAuth account
                const alreadyLinked = existingUser.accounts.some(
                    (acc: { provider: string }) => acc.provider === account.provider
                );

                if (alreadyLinked) return true;

                // PrismaAdapter to link account automatically
                return true;
            }

            return false;
        },

        async redirect({ url, baseUrl }) {
            try {
                if (url.startsWith("/")) {
                    return `${baseUrl}${url}`;
                }

                if (new URL(url).origin === baseUrl) {
                    return url;
                }
            } catch {
                return baseUrl;
            }

            return baseUrl;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
    
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
