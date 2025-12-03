import Link from "next/link";

type Props = {
  params: {
    locale: string;
  };
};

export default function LocaleNotFound({ params }: Props) {
  const locale = params.locale || "en";

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-xl w-full text-center text-slate-50 space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          404 – Page not found
        </p>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          This page doesn&apos;t exist in Levqor.
        </h1>

        <p className="text-sm md:text-base text-slate-300">
          The link might be outdated or the page was moved.
          Use the buttons below to continue.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition"
          >
            ← Back to {locale.toUpperCase()} homepage
          </Link>

          <Link
            href={`/${locale}/signin`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
          >
            Go to sign in
          </Link>
        </div>

        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-4">
          Levqor • Automation, compliance & control
        </p>
      </div>
    </main>
  );
}
