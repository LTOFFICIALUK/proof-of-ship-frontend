import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ handle: string }> },
) => {
  const { handle } = await context.params;
  const base = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) {
    return new NextResponse("API unavailable", { status: 503 });
  }
  const response = await fetch(`${base}/v1/builders/${encodeURIComponent(handle)}/badge.svg`, {
    cache: "no-store",
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "image/svg+xml",
      "cache-control": "public, max-age=300",
    },
  });
};
