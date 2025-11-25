"use client";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "inline" | "full" | "toast";
  className?: string;
}

const friendlyMessages: Record<string, string> = {
  "Failed to fetch": "Unable to connect to the server. Please check your internet connection.",
  "Failed to load workflow": "We couldn't load this workflow. It may have been deleted or you may not have access.",
  "Failed to save workflow": "Unable to save your changes. Please try again.",
  "Failed to build workflow": "The AI couldn't generate a workflow. Please try rephrasing your request.",
  "Failed to submit workflow": "Unable to submit this workflow. Please try again.",
  "Network Error": "Network connection lost. Please check your connection and try again.",
  "Unauthorized": "Your session has expired. Please sign in again.",
  "rate_limited": "Too many requests. Please wait a moment and try again."
};

function getFriendlyMessage(error: string): string {
  for (const [key, message] of Object.entries(friendlyMessages)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  return error.includes("Error") ? "Something went wrong. Please try again." : error;
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss,
  variant = "inline",
  className = ""
}: ErrorDisplayProps) {
  const friendlyError = getFriendlyMessage(error);

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">{friendlyError}</p>
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "toast") {
    return (
      <div className={`fixed bottom-4 right-4 z-50 animate-slide-up ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-sm">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-800">{friendlyError}</p>
            {onRetry && (
              <button onClick={onRetry} className="text-sm text-red-600 hover:underline mt-1">
                Retry
              </button>
            )}
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-red-700">{friendlyError}</p>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
