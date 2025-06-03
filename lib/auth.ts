import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signInSchema } from "./validations";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          // Validate input
          const validatedFields = signInSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!validatedFields.success) {
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validatedFields.data;

          // Find user in database
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user.length || !user[0].password) {
            throw new Error("Invalid credentials");
          }

          const foundUser = user[0];

          // Check if user is active
          if (!foundUser.isActive) {
            throw new Error("Account is deactivated");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, foundUser.password);

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            userType: foundUser.userType,
            subscriptionTier: foundUser.subscriptionTier,
            companyName: foundUser.companyName,
            image: foundUser.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
        token.subscriptionTier = user.subscriptionTier;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.userType = token.userType as string;
        session.user.subscriptionTier = token.subscriptionTier as string;
        session.user.companyName = token.companyName as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface User {
    userType: string;
    subscriptionTier: string;
    companyName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userType: string;
    subscriptionTier: string;
    companyName?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: string;
      subscriptionTier: string;
      companyName?: string;
      image?: string;
    };
  }
}
