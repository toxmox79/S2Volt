import type { AIModel, AiProviderPlan, ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { BaseProvider } from "./base";

export type OpenAICompatibleConfig = {
  providerId: string; name: string; baseUrl: string; apiKey?: string; model: string; headers?: Record<string, string>;
  capabilities: ModelCapabilities; plan: AiProviderPlan; priority: number; enabled: boolean;
};

export class OpenAICompatibleProvider extends BaseProvider {
  readonly id: string; readonly name: string;
  protected readonly baseUrl: string; protected readonly apiKey?: string; protected readonly headers: Record<string, string>;
  private readonly capabilities: ModelCapabilities;
  constructor(config: OpenAICompatibleConfig) {
    super(config.model, config.plan, config.priority, config.enabled);
    this.id = config.providerId; this.name = config.name; this.baseUrl = config.baseUrl.replace(/\/$/, ""); this.apiKey = config.apiKey; this.headers = config.headers ?? {}; this.capabilities = config.capabilities;
  }
  async getCapabilities() { return this.capabilities; }
  async chat(input: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey && this.id !== "ollama") throw new Error(`${this.name}: API-Key nicht konfiguriert`);
    const data = await this.fetchJson(`${this.baseUrl}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}), ...this.headers }, body: JSON.stringify({ model: this.model, messages: [{ role: "system", content: input.system }, { role: "user", content: input.prompt }], max_tokens: input.maxTokens ?? 1200, temperature: 0.1, ...(input.json ? { response_format: { type: "json_object" } } : {}) }) }) as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number }; model?: string };
    return { text: data.choices?.[0]?.message?.content ?? "", inputTokens: data.usage?.prompt_tokens, outputTokens: data.usage?.completion_tokens, model: data.model ?? this.model };
  }
  async listModels(): Promise<AIModel[]> {
    const data = await this.fetchJson(`${this.baseUrl}/models`, { headers: { ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}), ...this.headers } }) as { data?: Array<{ id: string }> };
    return (data.data ?? []).map((model) => ({ id: model.id }));
  }
}
