import { errorFromResponse, ProviderError } from "../errors";
import type { AIProvider, AiProviderPlan, AnalyzePositionsInput, AnalyzeProjectInput, ChatRequest, ChatResponse, ModelCapabilities, PositionAnalysisResult, ProjectAnalysisResult, ProviderTestResult } from "../types";

export abstract class BaseProvider implements AIProvider {
  temporarilyUnavailableUntil?: Date;
  abstract readonly id: string;
  abstract readonly name: string;
  constructor(public readonly model: string, public readonly plan: AiProviderPlan, public readonly priority: number, public readonly enabled: boolean) {}
  abstract getCapabilities(model: string): Promise<ModelCapabilities>;
  abstract chat(input: ChatRequest): Promise<ChatResponse>;

  async testConnection(): Promise<ProviderTestResult> {
    const started = performance.now();
    try {
      const response = await this.chat({ system: "Antworte knapp.", prompt: "Antworte exakt mit: S2VOLT_OK", maxTokens: 20 });
      return { success: response.text.includes("S2VOLT_OK"), model: response.model, latencyMs: Math.round(performance.now() - started), structuredOutput: (await this.getCapabilities(response.model)).structuredOutput };
    } catch (error) {
      return { success: false, model: this.model, latencyMs: Math.round(performance.now() - started), error: error instanceof Error ? error.message : "Unbekannter Fehler" };
    }
  }

  async analyzeProject(input: AnalyzeProjectInput): Promise<ProjectAnalysisResult> {
    const response = await this.chat({ system: "Du analysierst Elektro-Ausschreibungen. Antworte als valides JSON mit summary und confidence (0 bis 1).", prompt: JSON.stringify(input), json: true });
    return parseJson<ProjectAnalysisResult>(response.text);
  }

  async analyzePositions(input: AnalyzePositionsInput): Promise<PositionAnalysisResult[]> {
    const response = await this.chat({ system: "Extrahiere Elektro-Material. Antworte ausschließlich als JSON-Array. Jedes Element: position, materials, confidence, reasoning, source='AI'.", prompt: JSON.stringify(input), json: true });
    return parseJson<PositionAnalysisResult[]>(response.text);
  }

  protected async fetchJson(url: string, init: RequestInit) {
    let response: Response;
    try { response = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) }); }
    catch { throw new ProviderError("Provider nicht erreichbar", "NETWORK", 30_000); }
    const body = await response.text();
    if (!response.ok) throw errorFromResponse(response, body);
    try { return JSON.parse(body) as unknown; }
    catch { throw new ProviderError("Ungültige Provider-Antwort", "INVALID_RESPONSE"); }
  }
}

export function parseJson<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}
