import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
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
          throw new Error("Invalid credentials");
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        try {
          const res = await fetch(`${API_URL}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data) {
            throw new Error(data?.message || "Invalid credentials");
          }

          return {
            id: data._id || data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            balance: data.balance,
          };
        } catch (error: any) {
          console.error("AUTH_BACKEND_ERROR", error);
          throw new Error(error.message || "Authentication failed");
        }
      },

    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.balance = user.balance;
      }
      
      if (trigger === "update" && session?.balance !== undefined) {
        token.balance = session.balance;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.balance = token.balance as number;
      }
      return session;
    },
  },
};
