import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://www.levqor.ai";

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,

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
  ],

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        domain: ".levqor.ai",
        path: "/",
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax",
        secure: true,
        domain: ".levqor.ai",
        path: "/",
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },
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

  logger: {
    error(error: Error) {
      console.error("[NEXTAUTH LOGGER ERROR]", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        timestamp: new Date().toISOString(),
      });
    },
    warn(code: string) {
      console.warn("[NEXTAUTH LOGGER WARN]", { code, timestamp: new Date().toISOString() });
    },
    debug(code: string, metadata: unknown) {
      console.debug("[NEXTAUTH LOGGER DEBUG]", { code, metadata, timestamp: new Date().toISOString() });
    },
  },

  events: {
    async signIn(message) {
      console.log("[NEXTAUTH EVENT] signIn", {
        user: { email: message.user?.email ?? null, id: message.user?.id ?? null },
        provider: message.account?.provider ?? null,
        isNewUser: message.isNewUser ?? false,
        timestamp: new Date().toISOString(),
      });
    },
    async signOut() {
      console.log("[NEXTAUTH EVENT] signOut", {
        timestamp: new Date().toISOString(),
      });
    },
    async session(message) {
      console.log("[NEXTAUTH EVENT] session", {
        sessionUser: { email: message.session?.user?.email ?? null },
        timestamp: new Date().toISOString(),
      });
    },
  },
});
