"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-red-600 mb-4">500</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
          <a
            href="mailto:support@levqor.ai"
            className="px-6 py-3 border-2 border-black rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-block"
          >
            Contact Support
          </a>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-500 mt-6">Error ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
