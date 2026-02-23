import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";

export const authOptions = {
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        // Email/Password Provider
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email ve şifre gerekli");
                }

                // Kullanıcıyı veritabanından bul
                const user = await findUserByEmail(credentials.email);

                if (!user) {
                    throw new Error("Kullanıcı bulunamadı");
                }

                // Şifre kontrolü
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Geçersiz şifre");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    gender: user.gender,
                    role: user.role || "user",
                };
            }
        })
    ],

    // JWT Strategy
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 gün
    },

    // JWT Callbacks
    callbacks: {
        async jwt({ token, user, account }) {
            // İlk giriş
            if (user) {
                token.id = user.id;
                token.gender = user.gender;
                token.role = user.role;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
            }

            // Google ile giriş yapıldığında
            if (account?.provider === "google") {
                token.provider = "google";
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.gender = token.gender;
                session.user.role = token.role;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.provider = token.provider;
            }
            return session;
        },
    },

    // Custom Pages
    pages: {
        signIn: "/giris/erkek",
        error: "/giris/erkek",
    },

    // Security
    secret: process.env.NEXTAUTH_SECRET,

    // Debug (development'ta true)
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
