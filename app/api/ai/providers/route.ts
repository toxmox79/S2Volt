import { NextResponse } from "next/server";
import { createProviders } from "@/lib/ai/providers/registry";

export async function GET() {
  return NextResponse.json(createProviders().map((provider) => ({ id: provider.id, name: provider.name, enabled: provider.enabled, model: provider.model, priority: provider.priority, plan: { ...provider.plan, lastVerifiedAt: provider.plan.lastVerifiedAt?.toISOString() }, temporarilyUnavailableUntil: provider.temporarilyUnavailableUntil?.toISOString() })));
}
