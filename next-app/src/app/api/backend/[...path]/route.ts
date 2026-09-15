import type { NextRequest } from "next/server";
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`/api/${path.map(encodeURIComponent).join("/")}`, process.env.API_BASE_URL ?? "http://localhost:8080"); target.search = request.nextUrl.search;
  const headers = new Headers(); for (const name of ["accept", "content-type", "cookie", "x-xsrf-token"]) { const value = request.headers.get(name); if (value) headers.set(name, value); }
  const response = await fetch(target, { method: request.method, headers, body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(), cache: "no-store", redirect: "manual" });
  const outgoing = new Headers(response.headers); outgoing.delete("content-encoding"); outgoing.delete("content-length");
  return new Response(response.body, { status: response.status, headers: outgoing });
}
export const dynamic = "force-dynamic";
export const GET = proxy; export const POST = proxy; export const PUT = proxy; export const PATCH = proxy; export const DELETE = proxy;
