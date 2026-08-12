import { PaidProvidersDisabledError, ProviderError } from "./errors";
import type { AIProvider, Capability, ModelCapabilities, RoutedResponse, RouterRequest } from "./types";
import { usageStore } from "./usage-store";

const freePlans = new Set(["FREE_TIER", "FREE_TRIAL", "LOCAL", "HYBRID"]);
const capabilityMap: Record<Capability, keyof ModelCapabilities> = { TEXT: "text", STRUCTURED_OUTPUT: "structuredOutput", VISION: "vision", PDF: "pdf", LONG_CONTEXT: "maxContextTokens", TOOL_CALLING: "toolCalling", EMBEDDINGS: "embeddings" };

export class AiRouter {
  constructor(private providers: AIProvider[]) {}

  async route(request: RouterRequest): Promise<RoutedResponse> {
    const attempts: RoutedResponse["attempts"] = [];
    const ordered = await this.rank(request);
    let paidSkipped = false;
    for (const provider of ordered) {
      const paid = provider.plan.type === "PAID";
      if (paid && (!request.allowPaid || process.env.AI_ALLOW_PAID !== "true")) { paidSkipped = true; attempts.push({ providerId: provider.id, success: false, reason: "Kostenpflichtige APIs deaktiviert" }); continue; }
      if (provider.temporarilyUnavailableUntil && provider.temporarilyUnavailableUntil > new Date()) { attempts.push({ providerId: provider.id, success: false, reason: "Temporär nicht verfügbar" }); continue; }
      if (paid && provider.estimateCost && request.maxCostEur != null) {
        const estimate = await provider.estimateCost({ inputTokens: request.contextTokens ?? 0 });
        if (estimate.amountEur > request.maxCostEur) { attempts.push({ providerId: provider.id, success: false, reason: "Kostenbudget überschritten" }); continue; }
      }
      const started = performance.now();
      try {
        const response = await provider.chat(request);
        attempts.push({ providerId: provider.id, success: true });
        usageStore.record({ providerId: provider.id, success: true, inputTokens: response.inputTokens ?? 0, outputTokens: response.outputTokens ?? 0, estimatedCostEur: 0, latencyMs: Math.round(performance.now() - started), createdAt: new Date() });
        return { ...response, providerId: provider.id, attempts };
      } catch (error) {
        const code = error instanceof ProviderError ? error.code : "UNKNOWN";
        if (error instanceof ProviderError && ["RATE_LIMIT", "QUOTA", "MODEL_UNAVAILABLE", "NETWORK"].includes(error.code)) provider.temporarilyUnavailableUntil = new Date(Date.now() + (error.retryAfterMs ?? 60_000));
        attempts.push({ providerId: provider.id, success: false, reason: error instanceof Error ? error.message : "Unbekannter Fehler" });
        usageStore.record({ providerId: provider.id, success: false, inputTokens: 0, outputTokens: 0, estimatedCostEur: 0, latencyMs: Math.round(performance.now() - started), errorCode: code, createdAt: new Date() });
      }
    }
    if (paidSkipped) throw new PaidProvidersDisabledError();
    throw new Error(`Kein geeigneter AI-Provider erreichbar. Versuche: ${attempts.map((a) => `${a.providerId}: ${a.reason}`).join("; ")}`);
  }

  private async rank(request: RouterRequest) {
    const available: Array<{ provider: AIProvider; score: number }> = [];
    for (const provider of this.providers.filter((p) => p.enabled)) {
      if (request.manualProviderId && request.mode === "MANUAL" && provider.id !== request.manualProviderId) continue;
      const caps = await provider.getCapabilities(provider.model);
      if (!(request.requiredCapabilities ?? ["TEXT"]).every((cap) => cap === "LONG_CONTEXT" ? (caps.maxContextTokens ?? 0) >= (request.contextTokens ?? 0) : Boolean(caps[capabilityMap[cap]]))) continue;
      let score = 1000 - provider.priority * 10;
      if (request.mode === "FREE_FIRST" || request.mode === "AUTO") score += freePlans.has(provider.plan.type) ? 500 : -300;
      if (request.mode === "PRIVACY_FIRST") score += provider.plan.type === "LOCAL" ? 1000 : -600;
      if (request.mode === "QUALITY_FIRST") score += Number(caps.structuredOutput) * 90 + Number(caps.vision) * 60 + (caps.maxContextTokens ?? 0) / 100_000;
      if (request.documentType === "pdf" && caps.pdf) score += 150;
      available.push({ provider, score });
    }
    return available.sort((a, b) => b.score - a.score).map((item) => item.provider);
  }
}
