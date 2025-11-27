import NextAuth, { NextAuthConfig } from "next-auth"
import type { Provider } from "next-auth/providers"
import Google from "next-auth/providers/google"
import AzureAD from "next-auth/providers/azure-ad"
import Credentials from "next-auth/providers/credentials"

const DENYLIST = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', 'temp-mail.org'];

async function sendAuditEvent(event: string, email: string, userAgent?: string, ip?: string) {
  try {
    await fetch('https://api.levqor.ai/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        email,
        user_agent: userAgent,
        ip,
        ts: Date.now()
      })
    }).catch(() => {});
  } catch (err) {
  }
}

async function logAuthError(provider: string, errorType: string, errorMessage: string, context?: Record<string, unknown>) {
  const safeContext = context ? { ...context } : {};
  delete safeContext.token;
  delete safeContext.secret;
  delete safeContext.accessToken;
  delete safeContext.refreshToken;
  delete safeContext.idToken;
  
  console.error(`[NextAuth Error] Provider: ${provider}, Type: ${errorType}, Message: ${errorMessage}`, 
    JSON.stringify(safeContext, null, 2));
  
  try {
    await fetch('https://api.levqor.ai/api/guardian/telemetry/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'nextauth',
        level: 'error',
        event_type: 'oauth_error',
        message: `OAuth ${errorType}: ${errorMessage}`,
        meta: {
          provider,
          error_type: errorType,
          timestamp: new Date().toISOString(),
          nextauth_url: process.env.NEXTAUTH_URL || 'not_set'
        }
      })
    }).catch(() => {});
  } catch (err) {
  }
}

function buildProviders(): Provider[] {
  const providers: Provider[] = [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminEmail || !adminPassword) {
          throw new Error("Admin credentials not configured");
        }
        
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        
        if (email === adminEmail && password === adminPassword) {
          return {
            id: "admin",
            name: "Admin",
            email: adminEmail,
          };
        }
        
        throw new Error("Invalid credentials");
      },
    }),
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  } else {
    console.warn('[NextAuth] Google provider not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
  }

  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    providers.push(
      AzureAD({
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  } else {
    console.warn('[NextAuth] Microsoft provider not configured: MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET missing');
  }

  return providers;
}

export const authOptions: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  providers: buildProviders(),
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: { 
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email || '';
      const domain = email.split('@')[1];
      
      if (DENYLIST.includes(domain)) {
        await logAuthError(account?.provider || 'unknown', 'denied_domain', `Email domain ${domain} is blocked`);
        return false;
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn(message) {
      const email = message.user.email || 'unknown';
      await sendAuditEvent('sign_in', email, undefined, undefined);
    },
    async signOut(message) {
      const email = (message as any).token?.email || 'unknown';
      await sendAuditEvent('sign_out', email, undefined, undefined);
    },
  },
  logger: {
    error(code: Error, ...message: unknown[]) {
      const codeStr = code.message || 'unknown_error';
      const errorMsg = message.map(m => 
        typeof m === 'object' ? JSON.stringify(m) : String(m)
      ).join(' ');
      console.error(`[NextAuth][error][${codeStr}]`, errorMsg);
      logAuthError('system', codeStr, errorMsg);
    },
    warn(code: string) {
      console.warn(`[NextAuth][warn][${code}]`);
    },
    debug(code: string, ...message: unknown[]) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NextAuth][debug][${code}]`, ...message);
      }
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
