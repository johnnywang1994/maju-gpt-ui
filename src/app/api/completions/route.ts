// This route is deprecated. All chat requests are now handled by /api/responses.
export const dynamic = "force-dynamic";

export async function POST() {
  return new Response("Gone", { status: 410 });
}
