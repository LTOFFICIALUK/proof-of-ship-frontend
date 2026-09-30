import { NextResponse } from "next/server";

const proxy = async (request: Request, path: string[]) => {
  const base = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(
    /\/$/,
    "",
  );
  if (!base) {
    return NextResponse.json(
      {
        error: {
          code: "API_UNAVAILABLE",
          message: "The API is not connected yet. Set API_URL when the server is live.",
        },
      },
      { status: 503 },
    );
  }

  const incoming = new URL(request.url);
  const joined = path.join("/");
  const target = `${base}/${joined}${incoming.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const response = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text(),
    cache: "no-store",
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
};

export const GET = async (
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  return proxy(request, path);
};

export const POST = GET;
