import { notFound, redirect } from "next/navigation";

export default async function CoinSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) {
    notFound();
  }
  const response = await fetch(`${base}/v1/coins/${slug}`, { cache: "no-store" });
  if (!response.ok) {
    notFound();
  }
  const project = (await response.json()) as { mint: string };
  redirect(`/c/${project.mint}`);
}
