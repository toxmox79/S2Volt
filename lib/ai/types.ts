export type ProviderPlanType = "FREE_TIER" | "FREE_TRIAL" | "PAID" | "LOCAL" | "HYBRID";
export type RoutingMode = "AUTO" | "FREE_FIRST" | "QUALITY_FIRST" | "PRIVACY_FIRST" | "MANUAL" | "FALLBACK";
export type Capability = "TEXT" | "STRUCTURED_OUTPUT" | "VISION" | "PDF" | "LONG_CONTEXT" | "TOOL_CALLING" | "EMBEDDINGS";

export type AiProviderPlan = {
  type: ProviderPlanType;
  freeQuotaDescription?: string;
  requiresPaymentMethod?: boolean;
  notes?: string;
  lastVerifiedAt?: Date;
};

export type ModelCapabilities = {
  text: boolean;
  structuredOutput: boolean;
  vision: boolean;
  pdf: boolean;
  toolCalling?: boolean;
  embeddings: boolean;
  maxContextTokens?: number;
};

export type AIModel = { id: string; name?: string; capabilities?: ModelCapabilities };
export type ProviderTestResult = { success: boolean; model?: string; latencyMs: number; structuredOutput?: boolean; error?: string };
export type MaterialPosition = { position: string; shortText: string; longText?: string; quantity?: number; unit?: string };
export type AnalyzeProjectInput = { title?: string; description: string; documentType?: string };
export type AnalyzePositionsInput = { positions: MaterialPosition[] };
export type PositionAnalysisResult = { position: string; materials: Array<{ description: string; quantity?: number; unit?: string }>; confidence: number; reasoning: string; source: "RULE" | "AI" | "CACHE" };
export type ProjectAnalysisResult = { summary: string; positions?: PositionAnalysisResult[]; confidence: number };
export type CostEstimateInput = { inputTokens: number; outputTokens?: number; model?: string };
export type CostEstimate = { amountEur: number; estimated: boolean };
export type ChatRequest = { system: string; prompt: string; json?: boolean; maxTokens?: number };
export type ChatResponse = { text: string; inputTokens?: number; outputTokens?: number; model: string };

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly plan: AiProviderPlan;
  readonly priority: number;
  readonly model: string;
  readonly enabled: boolean;
  temporarilyUnavailableUntil?: Date;
  testConnection(): Promise<ProviderTestResult>;
  listModels?(): Promise<AIModel[]>;
  getCapabilities(model: string): Promise<ModelCapabilities>;
  chat(input: ChatRequest): Promise<ChatResponse>;
  analyzeProject(input: AnalyzeProjectInput): Promise<ProjectAnalysisResult>;
  analyzePositions(input: AnalyzePositionsInput): Promise<PositionAnalysisResult[]>;
  estimateCost?(input: CostEstimateInput): Promise<CostEstimate>;
}

export type RouterRequest = ChatRequest & {
  mode: RoutingMode;
  requiredCapabilities?: Capability[];
  documentType?: string;
  contextTokens?: number;
  manualProviderId?: string;
  allowPaid: boolean;
  maxCostEur?: number;
};

export type RoutedResponse = ChatResponse & { providerId: string; attempts: Array<{ providerId: string; success: boolean; reason?: string }> };
