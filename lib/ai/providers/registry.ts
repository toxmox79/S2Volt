import type { AIProvider, AiProviderPlan, ModelCapabilities } from "../types";
import { CloudflareWorkersAiProvider } from "./cloudflare";
import { GeminiProvider } from "./gemini";
import { NvidiaNimProvider } from "./nvidia";
import { OpenAICompatibleProvider } from "./openai-compatible";

const capabilities: ModelCapabilities = { text: true, structuredOutput: true, vision: false, pdf: false, embeddings: false, maxContextTokens: 128_000 };
const plan = (type: AiProviderPlan["type"], notes: string): AiProviderPlan => ({ type, notes });
const configured = (...values: Array<string | undefined>) => values.every(Boolean);

export function createProviders(): AIProvider[] {
  return [
    new NvidiaNimProvider({ baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1", apiKey: process.env.NVIDIA_API_KEY, model: process.env.NVIDIA_MODEL || "", capabilities, plan: plan("FREE_TRIAL", "Tarif und Kontingent durch Administrator prüfen."), priority: 1, enabled: configured(process.env.NVIDIA_API_KEY, process.env.NVIDIA_MODEL) }),
    new GeminiProvider(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL || "gemini-2.5-flash", plan("HYBRID", "Free-Tier-Konditionen können sich ändern."), 2, configured(process.env.GEMINI_API_KEY)),
    new OpenAICompatibleProvider({ providerId: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", apiKey: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL || "", capabilities, plan: plan("HYBRID", "Kostenmodell regelmäßig prüfen."), priority: 3, enabled: configured(process.env.GROQ_API_KEY, process.env.GROQ_MODEL) }),
    new CloudflareWorkersAiProvider(process.env.CLOUDFLARE_ACCOUNT_ID, process.env.CLOUDFLARE_AI_TOKEN, process.env.CLOUDFLARE_MODEL || "", plan("HYBRID", "Workers-AI-Kontingent wird administrativ gepflegt."), 4, configured(process.env.CLOUDFLARE_ACCOUNT_ID, process.env.CLOUDFLARE_AI_TOKEN, process.env.CLOUDFLARE_MODEL)),
    new OpenAICompatibleProvider({ providerId: "ollama", name: "Ollama", baseUrl: `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/v1`, model: process.env.OLLAMA_MODEL || "llama3.2", capabilities, plan: plan("LOCAL", "Keine externen Tokenkosten."), priority: 5, enabled: true }),
    new OpenAICompatibleProvider({ providerId: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || "gpt-4.1-mini", capabilities: { ...capabilities, vision: true }, plan: plan("PAID", "Kostenpflichtiger Premium-Provider."), priority: 6, enabled: configured(process.env.OPENAI_API_KEY) }),
    new OpenAICompatibleProvider({ providerId: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", apiKey: process.env.CEREBRAS_API_KEY, model: "", capabilities, plan: plan("HYBRID", "Adapter vorbereitet; Modell konfigurieren."), priority: 7, enabled: false }),
    new OpenAICompatibleProvider({ providerId: "mistral", name: "Mistral", baseUrl: "https://api.mistral.ai/v1", apiKey: process.env.MISTRAL_API_KEY, model: "", capabilities, plan: plan("PAID", "Adapter vorbereitet; Modell konfigurieren."), priority: 8, enabled: false }),
    new OpenAICompatibleProvider({ providerId: "huggingface", name: "Hugging Face Inference", baseUrl: "https://router.huggingface.co/v1", apiKey: process.env.HUGGINGFACE_TOKEN, model: "", capabilities, plan: plan("HYBRID", "Adapter vorbereitet; Modell konfigurieren."), priority: 9, enabled: false })
  ];
}
