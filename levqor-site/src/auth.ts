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
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url);
        const fromAddress = process.env.AUTH_FROM_EMAIL ?? provider.from;
        const apiKey = process.env.RESEND_API_KEY ?? provider.apiKey;

        console.log("========================================");
        console.log("[MAGIC_LINK_SEND_START]", JSON.stringify({
          timestamp: new Date().toISOString(),
          identifier: email,
          url: url,
          from: fromAddress,
          host: host,
          hasApiKey: !!apiKey,
          apiKeyPrefix: apiKey ? apiKey.substring(0, 6) + "..." : "MISSING",
          providerFrom: provider.from,
          envFrom: process.env.AUTH_FROM_EMAIL,
        }));
        console.log("========================================");

        const emailPayload = {
          from: fromAddress,
          to: [email],
          subject: "Sign in to Levqor",
          html: `
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
          `,
          text: `Sign in to Levqor\n\nClick this link to sign in: ${url}\n\nThis link expires in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`,
        };

        console.log("[MAGIC_LINK_PAYLOAD]", JSON.stringify({
          from: emailPayload.from,
          to: emailPayload.to,
          subject: emailPayload.subject,
          htmlLength: emailPayload.html.length,
          textLength: emailPayload.text.length,
        }));

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          });

          const responseText = await res.text();
          
          console.log("[MAGIC_LINK_RESEND_RESPONSE]", JSON.stringify({
            timestamp: new Date().toISOString(),
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            body: responseText,
          }));

          if (!res.ok) {
            console.error("========================================");
            console.error("[MAGIC_LINK_SEND_ERROR]", JSON.stringify({
              timestamp: new Date().toISOString(),
              status: res.status,
              statusText: res.statusText,
              responseBody: responseText,
              fromAddress: fromAddress,
              toAddress: email,
              apiKeyUsed: apiKey ? apiKey.substring(0, 6) + "..." : "MISSING",
            }));
            console.error("========================================");
            throw new Error(`Resend API error: ${res.status} - ${responseText}`);
          }

          console.log("========================================");
          console.log("[MAGIC_LINK_SEND_SUCCESS]", JSON.stringify({
            timestamp: new Date().toISOString(),
            identifier: email,
            from: fromAddress,
            responseBody: responseText,
          }));
          console.log("========================================");

        } catch (error: unknown) {
          const err = error as Error & { 
            cause?: unknown; 
            status?: number; 
            response?: { status?: number; body?: unknown };
          };
          
          let errorBody: unknown = null;
          try {
            if (err?.response?.body) {
              errorBody = err.response.body;
            } else if (err?.cause && typeof err.cause === 'object' && 'response' in err.cause) {
              const causeResp = (err.cause as { response?: { body?: unknown } }).response;
              errorBody = causeResp?.body;
            }
          } catch {
            errorBody = "BODY_PARSE_FAILED";
          }

          console.error("========================================");
          console.error("[MAGIC_LINK_SEND_EXCEPTION]", JSON.stringify({
            timestamp: new Date().toISOString(),
            identifier: email,
            from: fromAddress,
            errorMessage: err?.message ?? "Unknown error",
            errorName: err?.name ?? "UnknownError",
            errorStack: err?.stack ?? "No stack trace",
            errorCause: err?.cause ? String(err.cause) : null,
            errorStatus: err?.status ?? err?.response?.status ?? null,
            errorBody: errorBody,
            errorFull: String(err),
          }));
          console.error("========================================");

          throw error;
        }
      },

      // ================================================================
      // TEMPORARY FALLBACK (enable ONLY if Resend is completely broken):
      // Uncomment this block and comment out the above sendVerificationRequest
      // to bypass Resend entirely and just log the magic link URL.
      // ================================================================
      // async sendVerificationRequest({ identifier: email, url, provider }) {
      //   console.log("========================================");
      //   console.log("[MAGIC_LINK_FAKE_SEND] FALLBACK MODE ACTIVE");
      //   console.log("[MAGIC_LINK_FAKE_SEND]", JSON.stringify({
      //     timestamp: new Date().toISOString(),
      //     identifier: email,
      //     url: url,
      //     from: provider.from,
      //     message: "EMAIL NOT SENT - Copy URL from logs to sign in manually",
      //   }));
      //   console.log("========================================");
      //   // In fallback mode we pretend the email was sent successfully.
      //   return;
      // },
    }),
  ],

  pages: {
    signIn: "/signin",
    error: "/signin",
    verifyRequest: "/verify-request",
  },

  session: {
    strategy: "database",
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
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.email = user.email ?? session.user.email;
        session.user.name = user.name ?? session.user.name;
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
