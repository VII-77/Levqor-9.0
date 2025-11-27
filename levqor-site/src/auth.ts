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
  delete safeContext.id_token;
  delete safeContext.access_token;
  delete safeContext.refresh_token;
  
  console.error(`[NextAuth][error] Provider: ${provider}, Type: ${errorType}, Message: ${errorMessage}`, 
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

async function logAuthEvent(event: string, provider: string, status: 'success' | 'failure', details?: string) {
  console.log(`[NextAuth][${event}] Provider: ${provider}, Status: ${status}${details ? `, Details: ${details}` : ''}`);
  
  try {
    await fetch('https://api.levqor.ai/api/guardian/telemetry/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'nextauth',
        level: status === 'success' ? 'info' : 'warn',
        event_type: `oauth_${event}`,
        message: `OAuth ${event}: ${status}`,
        meta: {
          provider,
          status,
          details: details || null,
          timestamp: new Date().toISOString()
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
    console.log('[NextAuth] Google provider configured');
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
    console.log('[NextAuth] Microsoft/Azure AD provider configured');
  } else {
    console.warn('[NextAuth] Microsoft provider not configured: MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET missing');
  }

  return providers;
}

export const authOptions: NextAuthConfig = {
  debug: true,
  trustHost: true,
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
      try {
        const provider = account?.provider || 'unknown';
        const email = user.email || '';
        
        console.log(`[NextAuth][signIn] Callback triggered for provider: ${provider}, email: ${email ? email.substring(0, 3) + '***' : 'none'}`);
        
        if (!email) {
          await logAuthError(provider, 'missing_email', 'No email returned from OAuth provider');
          return false;
        }
        
        const domain = email.split('@')[1];
        
        if (domain && DENYLIST.includes(domain)) {
          await logAuthError(provider, 'denied_domain', `Email domain ${domain} is blocked`);
          return false;
        }
        
        await logAuthEvent('signin_callback', provider, 'success', `User: ${email.substring(0, 3)}***`);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error in signIn callback';
        await logAuthError(account?.provider || 'unknown', 'signin_callback_error', errorMessage);
        console.error('[NextAuth][signIn] Callback error:', errorMessage);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (account && user) {
          console.log(`[NextAuth][jwt] New token created for provider: ${account.provider}`);
          token.provider = account.provider;
          token.id = user.id;
        }
        return token;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error in jwt callback';
        console.error('[NextAuth][jwt] Callback error:', errorMessage);
        await logAuthError('jwt', 'jwt_callback_error', errorMessage);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          (session.user as { id?: string }).id = token.id as string;
          (session as { provider?: string }).provider = token.provider as string;
        }
        return session;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error in session callback';
        console.error('[NextAuth][session] Callback error:', errorMessage);
        return session;
      }
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
      const provider = message.account?.provider || 'unknown';
      console.log(`[NextAuth][event:signIn] User signed in via ${provider}`);
      await sendAuditEvent('sign_in', email, undefined, undefined);
      await logAuthEvent('signin_complete', provider, 'success');
    },
    async signOut(message) {
      const token = message as { token?: { email?: string } };
      const email = token.token?.email || 'unknown';
      console.log(`[NextAuth][event:signOut] User signed out`);
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
      console.log(`[NextAuth][debug][${code}]`, ...message);
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
