import { OpenAICompatibleProvider, type OpenAICompatibleConfig } from "./openai-compatible";

export class NvidiaNimProvider extends OpenAICompatibleProvider {
  constructor(config: Omit<OpenAICompatibleConfig, "providerId" | "name">) { super({ ...config, providerId: "nvidia", name: "NVIDIA NIM" }); }
}
