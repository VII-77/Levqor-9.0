import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard V2 | Levqor',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    }
  }
};

export default function DashboardV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
