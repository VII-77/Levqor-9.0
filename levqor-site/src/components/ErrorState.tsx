import Link from "next/link";

interface Props {
  type: "checkout" | "billing" | "workflow" | "generic";
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  type,
  title,
  message,
  actionText,
  actionHref,
  onRetry
}: Props) {
  const defaults = {
    checkout: {
      icon: "💳",
      title: "Checkout Failed",
      message: "We couldn't process your payment. Please check your card details and try again.",
      actionText: "Try Again",
      actionHref: undefined,
    },
    billing: {
      icon: "⚠️",
      title: "Billing Issue",
      message: "There was an issue with your billing. Please update your payment method.",
      actionText: "Update Payment Method",
      actionHref: "/dashboard/billing",
    },
    workflow: {
      icon: "🔧",
      title: "Workflow Error",
      message: "Your workflow encountered an error. Check the logs for more details.",
      actionText: "View Logs",
      actionHref: undefined,
    },
    generic: {
      icon: "❌",
      title: "Something Went Wrong",
      message: "An unexpected error occurred. Please try again or contact support if the issue persists.",
      actionText: "Contact Support",
      actionHref: "/support",
    },
  };

  const config = defaults[type];
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalActionText = actionText || config.actionText;
  const finalActionHref = actionHref || config.actionHref;

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 text-center">
        <div className="text-5xl mb-4">{config.icon}</div>
        <h2 className="text-2xl font-bold mb-3">{finalTitle}</h2>
        <p className="text-gray-600 mb-6">{finalMessage}</p>
        
        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
            >
              {finalActionText}
            </button>
          )}
          
          {finalActionHref && !onRetry && (
            <Link
              href={finalActionHref}
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium inline-block"
            >
              {finalActionText}
            </Link>
          )}
          
          <Link
            href="/support"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
