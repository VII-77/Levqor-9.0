import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-900 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for. The link might be broken or the page may have been removed.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 border-2 border-black rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            View Pricing
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Documentation
          </Link>
        </div>
      </div>
    </main>
  );
}
