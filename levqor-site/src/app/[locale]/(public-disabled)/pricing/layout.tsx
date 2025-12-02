import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing – Levqor automation plans',
  description: 'Transparent Levqor pricing. Four plans, 7-day free trial on every tier. Only pay for successful automated workflows.',
  alternates: {
    canonical: 'https://www.levqor.ai/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
