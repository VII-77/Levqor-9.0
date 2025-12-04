import { notFound } from "next/navigation";
import { getProductBySlug } from "@/config/products";
import ProductPageClient from "./ProductPageClient";

interface ProductPageProps {
  params: { slug: string; locale: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Levqor`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: "website",
    },
  };
}
