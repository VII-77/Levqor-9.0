import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "./db/schema";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://www.levqor.ai";
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const AUTH_FROM_EMAIL = process.env.AUTH_FROM_EMAIL || "login@levqor.ai";

console.log("[NEXTAUTH_BOOT]", JSON.stringify({
  timestamp: new Date().toISOString(),
  NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  hasAuthSecret: !!AUTH_SECRET,
  hasResendApiKey: !!RESEND_API_KEY,
  authFromEmail: AUTH_FROM_EMAIL,
}));

if (!AUTH_SECRET) {
  console.error("[NEXTAUTH_CONFIG_ERROR] Missing AUTH_SECRET or NEXTAUTH_SECRET - authentication will fail!");
}

if (!RESEND_API_KEY) {
  console.error("[NEXTAUTH_CONFIG_ERROR] Missing RESEND_API_KEY - magic link emails will not work!");
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  trustHost: true,
  secret: AUTH_SECRET,

  providers: [
    Resend({
      apiKey: RESEND_API_KEY,
      from: AUTH_FROM_EMAIL,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);

        // ===== [MAGIC_LINK_SEND_START] =====
        console.log("[MAGIC_LINK_SEND_START]", {
          timestamp: new Date().toISOString(),
          email: identifier,
          fromEnv: process.env.AUTH_FROM_EMAIL,
          resendApiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8),
          url,
          host,
        });

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 24px; text-align: center;">Sign in to Levqor</h1>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Click the button below to securely sign in to your Levqor account. This link expires in 24 hours.
              </p>
              <a href="${url}" style="display: block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-weight: 600; text-align: center; font-size: 16px;">
                Sign in to Levqor
              </a>
              <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0; text-align: center;">
                If you didn't request this email, you can safely ignore it.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                Levqor - Autonomous Data Backup Platform
              </p>
            </div>
          </body>
          </html>
        `;

        const text = `Sign in to Levqor\n\nClick this link to sign in: ${url}\n\nThis link expires in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`;

        // ===== [MAGIC_LINK_PAYLOAD] =====
        console.log("[MAGIC_LINK_PAYLOAD]", {
          from: process.env.AUTH_FROM_EMAIL,
          to: identifier,
          subject: "Your Levqor sign-in link",
          htmlLength: html.length,
          textLength: text.length,
        });

        try {
          const send = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.AUTH_FROM_EMAIL,
              to: [identifier],
              subject: "Your Levqor sign-in link",
              html,
              text,
            }),
          });

          const responseBody = await send.text();

          // ===== [MAGIC_LINK_RESEND_RESPONSE] =====
          console.log("[MAGIC_LINK_RESEND_RESPONSE]", {
            status: send.status,
            statusText: send.statusText,
            ok: send.ok,
            headers: Object.fromEntries(send.headers.entries()),
            body: responseBody,
          });

          if (!send.ok) {
            throw new Error(`Resend API error: ${send.status} - ${responseBody}`);
          }

          // ===== [MAGIC_LINK_SEND_SUCCESS] =====
          console.log("[MAGIC_LINK_SEND_SUCCESS]", {
            email: identifier,
            url,
            from: process.env.AUTH_FROM_EMAIL,
          });

        } catch (error: unknown) {
          const err = error as Error;

          // ===== [MAGIC_LINK_SEND_EXCEPTION] =====
          console.error("[MAGIC_LINK_SEND_EXCEPTION]", {
            message: err.message,
            name: err.name,
            stack: err.stack,
            cause: err.cause || null,
            resendKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8),
            email: identifier,
            url,
          });

          throw error;
        }
      },
    }),
  ],

  pages: {
    signIn: "/signin",
    error: "/signin",
    verifyRequest: "/verify-request",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.includes("levqor.ai")
    ? {
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
      }
    : undefined,

  callbacks: {
    async signIn({ user, account }) {
      console.log("[MAGIC_LINK_SIGNIN_CALLBACK]", JSON.stringify({
        timestamp: new Date().toISOString(),
        userEmail: user?.email ?? null,
        userId: user?.id ?? null,
        provider: account?.provider ?? null,
      }));

      if (!user?.email) {
        console.error("[MAGIC_LINK_SIGNIN_REJECTED] No email provided");
        return false;
      }

      console.log("[MAGIC_LINK_SIGNIN_SUCCESS]", JSON.stringify({
        email: user.email,
        provider: account?.provider,
      }));
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const origin = NEXTAUTH_URL;
      
      try {
        const targetUrl = url.startsWith("/") ? new URL(url, origin) : new URL(url);
        const targetPath = targetUrl.pathname;
        
        const isSigninPath = targetPath === "/signin" || 
          targetPath.match(/^\/[a-z]{2}(-[A-Za-z]+)?\/signin$/);
        
        if (isSigninPath) {
          const dashboardUrl = `${origin}/en/dashboard`;
          console.log("[AUTH_REDIRECT] Signin loop detected, redirecting to dashboard:", dashboardUrl);
          return dashboardUrl;
        }
        
        if (url.startsWith("/")) {
          const fullUrl = `${origin}${url}`;
          console.log("[AUTH_REDIRECT] Relative path:", fullUrl);
          return fullUrl;
        }
        
        if (targetUrl.origin === origin || targetUrl.origin === baseUrl) {
          console.log("[AUTH_REDIRECT] Same origin:", url);
          return url;
        }
        
        const fallback = `${origin}/en/dashboard`;
        console.log("[AUTH_REDIRECT] External URL blocked, fallback:", fallback);
        return fallback;
      } catch (err) {
        console.error("[AUTH_REDIRECT] URL parse error:", err);
        return `${origin}/en/dashboard`;
      }
    },
  },

  debug: process.env.NODE_ENV !== "production",

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
    async signOut() {
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
  },
});
