import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://www.levqor.ai";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: IS_PRODUCTION ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: IS_PRODUCTION,
        domain: IS_PRODUCTION ? ".levqor.ai" : undefined,
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          console.debug("[AUTH] Credentials: no email provided");
          return null;
        }
        console.debug("[AUTH] Credentials login:", credentials.email);
        return {
          id: credentials.email as string,
          email: credentials.email as string,
          name: (credentials.email as string).split("@")[0],
        };
      },
    }),
  ],

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id || token.sub;
        token.email = user.email || token.email;
        token.name = user.name || token.name;
        console.debug("[AUTH] JWT callback - user login:", token.email);
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as { id?: string }).id = token.sub;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const origin = NEXTAUTH_URL;
      if (url.startsWith("/")) {
        const fullUrl = `${origin}${url}`;
        console.debug("[AUTH] Redirect (relative):", fullUrl);
        return fullUrl;
      }
      if (url.startsWith(origin) || url.startsWith(baseUrl)) {
        console.debug("[AUTH] Redirect (absolute):", url);
        return url;
      }
      const fallback = `${origin}/en/post-auth`;
      console.debug("[AUTH] Redirect (fallback):", fallback);
      return fallback;
    },
  },

  debug: process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_AUTH_DEBUG === "1",

  events: {
    async signIn(message) {
      console.log("[AUTH EVENT] signIn", {
        user: { email: message.user?.email ?? null, id: message.user?.id ?? null },
        accountProvider: message.account?.provider ?? null,
      });
    },
    async session(message) {
      console.log("[AUTH EVENT] session", {
        sessionUser: { email: message.session?.user?.email ?? null },
      });
    },
  },
});
