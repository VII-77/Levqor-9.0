// levqor-site/src/app/[locale]/page.tsx

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getActiveProducts, type ProductConfig } from "@/config/products";

type PageProps = {
  params: { locale: string };
};

// Optional: basic SEO – adjust if you already have metadata wired
export const metadata: Metadata = {
  title: "Levqor – Omega Automation Engine",
  description: "Automation without limits. Build, deploy, and scale automated workflows with the Omega Automation Engine.",
};

function ProductPrice({ product }: { product: ProductConfig }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-semibold text-emerald-400">
        £{product.priceUsd ?? 47}
      </span>
      <span className="text-xs text-slate-400 uppercase tracking-wide">
        one-time
      </span>
    </div>
  );
}

function ProductThumbnail({ product }: { product: ProductConfig }) {
  const src = product.thumbnailImage || product.coverImage || product.heroImage;

  if (!src) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 text-xs text-slate-300">
        {product.name}
      </div>
    );
  }

  return (
    <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <Image
        src={src}
        alt={product.name}
        fill
        sizes="(min-width: 1024px) 280px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function ProductGridCard({
  product,
  locale,
}: {
  product: ProductConfig;
  locale: string;
}) {
  const internalHref = `/${locale}/products/${product.slug}`;

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_0_40px_rgba(15,23,42,0.6)]">
      <ProductThumbnail product={product} />
      <div className="mt-4 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {product.status === "active" ? "Available Now" : product.status}
        </div>
        <h3 className="text-sm font-semibold text-slate-50">
          {product.name}
        </h3>
        <p className="text-xs text-slate-300 line-clamp-3">
          {product.shortDescription}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <ProductPrice product={product} />
        <div className="flex gap-2">
          <Link
            href={internalHref}
            className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-slate-400 hover:text-slate-50 transition"
          >
            Details
          </Link>
          <a
            href={product.gumroadUrl || internalHref}
            target={product.gumroadUrl ? "_blank" : "_self"}
            rel={product.gumroadUrl ? "noreferrer" : undefined}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 transition"
          >
            Get Engine
          </a>
        </div>
      </div>
    </div>
  );
}

function HeroVisual({ product }: { product: ProductConfig }) {
  const src = product.heroImage || product.coverImage || product.thumbnailImage;

  if (!src) {
    return (
      <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_10%_20%,#22c55e_0,transparent_55%),radial-gradient(circle_at_80%_0%,#38bdf8_0,transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-end p-6">
          <p className="text-xs font-medium text-emerald-300/80 uppercase tracking-[0.25em]">
            Omega Visual Core
          </p>
          <p className="mt-2 text-sm text-slate-100">
            Drop your hero image into the Omega asset folder to replace this
            placeholder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900">
      <Image
        src={src}
        alt={product.name}
        fill
        sizes="(min-width: 1024px) 480px, 100vw"
        className="object-cover"
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-transparent to-emerald-500/20" />
    </div>
  );
}

export default async function HomePage({ params: { locale } }: PageProps) {
  const products = getActiveProducts();
  const mainProduct =
    products.find((p) => p.slug === "automation-accelerator") || products[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Outer container */}
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-6 lg:pb-24 lg:pt-10">
        {/* TOP NAV */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 text-sm font-black">
              Ω
            </div>
            <span className="text-sm font-semibold tracking-wide text-slate-100">
              Levqor
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-xs text-slate-300 md:flex">
            <Link href={`/${locale}/products`} className="hover:text-slate-50">
              Products
            </Link>
            <Link href={`/${locale}/pricing`} className="hover:text-slate-50">
              Pricing
            </Link>
            <Link href={`/${locale}/learn`} className="hover:text-slate-50">
              Learn
            </Link>
            <Link
              href={`/${locale}/signin`}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-medium hover:border-slate-400 hover:text-slate-50 transition"
            >
              Login
            </Link>
            <Link
              href={`/${locale}/products/automation-accelerator`}
              className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Get Automation Engine
            </Link>
          </nav>
        </header>

        {/* HERO */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Omega Automation Engine • Live
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
                Automation without limits.
              </h1>
              <p className="max-w-xl text-sm text-slate-300 sm:text-[15px]">
                Build, deploy, and scale automated workflows — even if you&apos;ve
                never shipped an automation before. Omega handles the plumbing.
                You keep the results.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/products/automation-accelerator`}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:bg-emerald-400 transition"
              >
                Get The Omega Automation Engine
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-400 hover:text-slate-50 transition"
              >
                Watch 30s Demo
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Launch-ready workflows</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>No-code friendly</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span>One-time purchase</span>
              </div>
            </div>
          </div>

          {mainProduct && <HeroVisual product={mainProduct} />}
        </section>

        {/* TRUST BAR */}
        <section className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-[11px] text-slate-300 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Setup in under 60 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>No coding required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Lifetime access, one-time price</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            <span>30-day “no results, no pay” guarantee</span>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 sm:text-base">
                Start with an engine.
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Omega will handle the repetitive work. You focus on closing
                clients and delivering outcomes.
              </p>
            </div>
            <Link
              href={`/${locale}/products`}
              className="text-[11px] font-medium text-slate-300 hover:text-slate-50"
            >
              View all products →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                locale={locale}
              />
            ))}
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs font-semibold text-slate-100">
              No-code friendly
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Drag, drop, and configure. Omega Automation Engine gives you
              ready-made flows you can adapt in minutes.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs font-semibold text-slate-100">
              Instant deploy
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Ship automation this week, not &quot;when I have time&quot;. Your
              first live workflow can go out the same day.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs font-semibold text-slate-100">
              Built for real work
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Client onboarding, reporting, follow-ups, operations. The boring
              parts that eat your time — automated.
            </p>
          </div>
        </section>

        {/* SCARCITY / URGENCY STRIP */}
        <section className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-slate-900 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-[0.22em]">
                Launch pricing live
              </p>
              <p className="text-sm text-slate-50">
                First buyers get free setup support for Omega Automation Engine.
              </p>
              <p className="text-[11px] text-emerald-200/80">
                When this goes, it&apos;s gone. Your automations won&apos;t
                build themselves.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {mainProduct && <ProductPrice product={mainProduct} />}
              <a
                href={mainProduct?.gumroadUrl || `/${locale}/products/automation-accelerator`}
                target={mainProduct?.gumroadUrl ? "_blank" : "_self"}
                rel={mainProduct?.gumroadUrl ? "noreferrer" : undefined}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
              >
                Claim Launch Offer
              </a>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Ready when you are
          </p>
          <h2 className="text-base font-semibold text-slate-50 sm:text-lg">
            Ready to stop doing everything manually?
          </h2>
          <p className="mx-auto max-w-md text-xs text-slate-400">
            Plug the Omega Automation Engine into your work and let it run in
            the background while you focus on what actually moves the needle.
          </p>
          <div className="mt-2 flex justify-center">
            <Link
              href={`/${locale}/products/automation-accelerator`}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Get The Omega Automation Engine
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-4 border-t border-slate-900 pt-4 text-[11px] text-slate-500">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Levqor. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-slate-300">
                Privacy
              </Link>
              <Link href={`/${locale}/legal/terms`} className="hover:text-slate-300">
                Terms
              </Link>
              <Link href={`/${locale}/legal/cookies`} className="hover:text-slate-300">
                Cookies
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
                }
