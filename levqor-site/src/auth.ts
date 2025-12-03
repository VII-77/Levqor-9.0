import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://www.levqor.ai";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || "common";

console.log("[NEXTAUTH_BOOT]", JSON.stringify({
  timestamp: new Date().toISOString(),
  NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  hasGoogleClientId: !!GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!GOOGLE_CLIENT_SECRET,
  hasMicrosoftClientId: !!MICROSOFT_CLIENT_ID,
  hasMicrosoftClientSecret: !!MICROSOFT_CLIENT_SECRET,
  microsoftTenantId: MICROSOFT_TENANT_ID,
}));

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("[NEXTAUTH_CONFIG_ERROR] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}
if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
  console.error("[NEXTAUTH_CONFIG_ERROR] Missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET");
}

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!AUTH_SECRET) {
  console.error("[NEXTAUTH_CONFIG_ERROR] Missing AUTH_SECRET or NEXTAUTH_SECRET - authentication will fail!");
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: AUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    MicrosoftEntraID({
      clientId: MICROSOFT_CLIENT_ID,
      clientSecret: MICROSOFT_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/v2.0`,
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
    async signIn({ user, account, profile }) {
      console.log("[AUTH_SIGNIN_CALLBACK]", JSON.stringify({
        timestamp: new Date().toISOString(),
        userEmail: user?.email ?? null,
        userId: user?.id ?? null,
        provider: account?.provider ?? null,
        providerAccountId: account?.providerAccountId ?? null,
        hasProfile: !!profile,
        profileEmail: (profile as { email?: string })?.email ?? null,
      }));
      
      if (!user?.email) {
        console.error("[AUTH_SIGNIN_REJECTED] No email provided by OAuth provider");
        return false;
      }
      
      console.log("[AUTH_SIGNIN_ALLOWED]", JSON.stringify({
        email: user.email,
        provider: account?.provider,
      }));
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id || token.sub;
        token.email = user.email || token.email;
        token.name = user.name || token.name;
        console.log("[AUTH_JWT_CALLBACK]", JSON.stringify({
          timestamp: new Date().toISOString(),
          email: token.email,
          provider: account?.provider ?? token.provider ?? null,
        }));
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

  debug: true,

  logger: {
    error(error: Error) {
      console.log("========================================");
      console.log("[NEXTAUTH_ERROR]", JSON.stringify({
        errorName: error?.name ?? "UnknownError",
        errorMessage: error?.message ?? "No message",
        errorStack: error?.stack ?? "No stack",
        errorCause: String(error?.cause ?? "No cause"),
        timestamp: new Date().toISOString(),
      }));
      console.log("========================================");
    },
    warn(code: string) {
      console.log("[NEXTAUTH_WARN]", JSON.stringify({
        code,
        timestamp: new Date().toISOString(),
      }));
    },
    debug(code: string, metadata: unknown) {
      console.log("[NEXTAUTH_DEBUG]", JSON.stringify({
        code,
        metadata: typeof metadata === "object" ? JSON.stringify(metadata) : String(metadata),
        timestamp: new Date().toISOString(),
      }));
    },
  },

  events: {
    async signIn(message) {
      console.log("[NEXTAUTH_EVENT_SIGNIN]", JSON.stringify({
        userEmail: message.user?.email ?? null,
        userId: message.user?.id ?? null,
        provider: message.account?.provider ?? null,
        providerType: message.account?.type ?? null,
        isNewUser: message.isNewUser ?? false,
        timestamp: new Date().toISOString(),
      }));
    },
    async signOut(message) {
      console.log("[NEXTAUTH_EVENT_SIGNOUT]", JSON.stringify({
        timestamp: new Date().toISOString(),
      }));
    },
    async session(message) {
      console.log("[NEXTAUTH_EVENT_SESSION]", JSON.stringify({
        userEmail: message.session?.user?.email ?? null,
        hasUser: !!message.session?.user,
        timestamp: new Date().toISOString(),
      }));
    },
    async createUser(message) {
      console.log("[NEXTAUTH_EVENT_CREATEUSER]", JSON.stringify({
        userEmail: message.user?.email ?? null,
        userId: message.user?.id ?? null,
        timestamp: new Date().toISOString(),
      }));
    },
    async linkAccount(message) {
      console.log("[NEXTAUTH_EVENT_LINKACCOUNT]", JSON.stringify({
        provider: message.account?.provider ?? null,
        userId: message.user?.id ?? null,
        timestamp: new Date().toISOString(),
      }));
    },
  },
});
