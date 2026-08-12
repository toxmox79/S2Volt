import { describe, expect, it } from "vitest";
import { AiRouter } from "./router";
import type { AIProvider } from "./types";

const mock = (id: string, type: "PAID"|"LOCAL"|"FREE_TIER", priority: number): AIProvider => ({ id, name:id, plan:{type}, priority, model:"x", enabled:true, testConnection:async()=>({success:true,latencyMs:1}), getCapabilities:async()=>({text:true,structuredOutput:true,vision:false,pdf:false,embeddings:false}), chat:async()=>({text:id,model:"x"}), analyzeProject:async()=>({summary:"",confidence:1}), analyzePositions:async()=>[] });

describe("AiRouter", () => {
  it("bevorzugt im FREE_FIRST-Modus einen kostenfreien Provider", async () => {
    const result = await new AiRouter([mock("paid","PAID",1),mock("free","FREE_TIER",9)]).route({system:"",prompt:"x",mode:"FREE_FIRST",allowPaid:true});
    expect(result.providerId).toBe("free");
  });
  it("bevorzugt im PRIVACY_FIRST-Modus den lokalen Provider", async () => {
    const result = await new AiRouter([mock("free","FREE_TIER",1),mock("local","LOCAL",9)]).route({system:"",prompt:"x",mode:"PRIVACY_FIRST",allowPaid:false});
    expect(result.providerId).toBe("local");
  });
});
