import { NextResponse } from "next/server";
import { createProviders } from "@/lib/ai/providers/registry";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const provider = createProviders().find((item) => item.id === id);
  if (!provider) return NextResponse.json({ error: "Provider nicht gefunden" }, { status: 404 });
  return NextResponse.json(await provider.testConnection());
}
