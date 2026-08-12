import { NextResponse } from "next/server";
import { usageStore } from "@/lib/ai/usage-store";
export async function GET() { return NextResponse.json({ providers: usageStore.summary(), events: usageStore.list().slice(-100).reverse() }); }
