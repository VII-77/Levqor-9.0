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
    // Fire-and-forget
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
  }

  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    providers.push(
      AzureAD({
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthConfig = {
  providers: buildProviders(),
  pages: {
    signIn: '/signin',
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
        return false;
      }
      
      return true;
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
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
