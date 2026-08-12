import type { AiProviderPlan, ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { BaseProvider } from "./base";

export class CloudflareWorkersAiProvider extends BaseProvider {
  readonly id = "cloudflare"; readonly name = "Cloudflare Workers AI";
  constructor(private accountId: string | undefined, private token: string | undefined, model: string, plan: AiProviderPlan, priority: number, enabled: boolean) { super(model, plan, priority, enabled); }
  async getCapabilities(): Promise<ModelCapabilities> { return { text: true, structuredOutput: false, vision: false, pdf: false, embeddings: false, maxContextTokens: 32_000 }; }
  async chat(input: ChatRequest): Promise<ChatResponse> {
    if (!this.accountId || !this.token) throw new Error("Cloudflare Workers AI: Zugangsdaten nicht konfiguriert");
    const data = await this.fetchJson(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`, { method: "POST", headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" }, body: JSON.stringify({ messages: [{ role: "system", content: input.system }, { role: "user", content: input.prompt }], max_tokens: input.maxTokens ?? 1200 }) }) as { result?: { response?: string }; usage?: { prompt_tokens?: number; completion_tokens?: number } };
    return { text: data.result?.response ?? "", inputTokens: data.usage?.prompt_tokens, outputTokens: data.usage?.completion_tokens, model: this.model };
  }
}
