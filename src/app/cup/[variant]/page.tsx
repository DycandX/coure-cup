import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BY_SLUG } from "@/lib/products";
import { CupPage } from "@/components/CupPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ variant: "s" }, { variant: "m" }, { variant: "l" }];
}

type Params = Promise<{ variant: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { variant } = await params;
  const product = BY_SLUG[variant as keyof typeof BY_SLUG];
  return { title: product ? `${product.name} | CUORE` : "CUORE" };
}

export default async function Page({ params }: { params: Params }) {
  const { variant } = await params;
  const product = BY_SLUG[variant as keyof typeof BY_SLUG];
  if (!product) notFound();
  return <CupPage slug={product.slug} />;
}
