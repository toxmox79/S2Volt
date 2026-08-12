import { NextResponse } from "next/server";
import { z } from "zod";
import { AiRouter } from "@/lib/ai/router";
import { createProviders } from "@/lib/ai/providers/registry";

const bodySchema = z.object({ prompt: z.string().min(1).max(100_000), mode: z.enum(["AUTO","FREE_FIRST","QUALITY_FIRST","PRIVACY_FIRST","MANUAL","FALLBACK"]).default("FREE_FIRST"), allowPaid: z.boolean().default(false), manualProviderId: z.string().optional() });

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const router = new AiRouter(createProviders());
    const response = await router.route({ ...body, system: "Du unterstützt die technische Elektro-Materialplanung. Antworte nachvollziehbar und knapp.", requiredCapabilities: ["TEXT"] });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Ungültige Eingabe", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analyse fehlgeschlagen" }, { status: 503 });
  }
}
