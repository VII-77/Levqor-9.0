import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const error = searchParams.get("error") || "unknown";
  const provider = searchParams.get("provider") || null;
  
  const errorDescriptions: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link may have been used already or is invalid.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from the OAuth provider.",
    OAuthCreateAccount: "Could not create an account with this provider.",
    EmailCreateAccount: "Could not create an account with this email.",
    Callback: "Error in the OAuth callback handler.",
    OAuthAccountNotLinked: "To confirm your identity, sign in with the same method you used originally.",
    EmailSignin: "The email could not be sent.",
    CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
    SessionRequired: "Please sign in to access this page.",
    Default: "An unexpected error occurred during sign-in.",
  };

  const description = errorDescriptions[error] || errorDescriptions.Default;

  console.log(`[Auth.js][error] code=${error} provider=${provider || "none"}`);

  return NextResponse.json(
    {
      ok: false,
      error,
      description,
      provider,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
