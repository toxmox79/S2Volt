import type { AIModel, AiProviderPlan, ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { BaseProvider } from "./base";

export class GeminiProvider extends BaseProvider {
  readonly id = "gemini"; readonly name = "Google Gemini";
  constructor(private apiKey: string | undefined, model: string, plan: AiProviderPlan, priority: number, enabled: boolean) { super(model, plan, priority, enabled); }
  async getCapabilities(): Promise<ModelCapabilities> { return { text: true, structuredOutput: true, vision: true, pdf: true, embeddings: true, maxContextTokens: 1_000_000 }; }
  async chat(input: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error("Google Gemini: API-Key nicht konfiguriert");
    const data = await this.fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${this.apiKey}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: input.system }] }, contents: [{ role: "user", parts: [{ text: input.prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: input.maxTokens ?? 1200, ...(input.json ? { responseMimeType: "application/json" } : {}) } }) }) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }; modelVersion?: string };
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "", inputTokens: data.usageMetadata?.promptTokenCount, outputTokens: data.usageMetadata?.candidatesTokenCount, model: data.modelVersion ?? this.model };
  }
  async listModels(): Promise<AIModel[]> {
    if (!this.apiKey) return [];
    const data = await this.fetchJson(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`, {}) as { models?: Array<{ name: string; displayName?: string }> };
    return (data.models ?? []).map((m) => ({ id: m.name.replace("models/", ""), name: m.displayName }));
  }
}
