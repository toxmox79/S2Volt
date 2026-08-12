import { describe, expect, it } from "vitest";
import { PreClassifier } from "./pre-classifier";

describe("PreClassifier", () => {
  it("erkennt eine eindeutige NYM-Leitung ohne AI", () => {
    const result = new PreClassifier().classify({ position: "1.1", shortText: "500 m NYM-J 3x1,5", quantity: 500, unit: "m" });
    expect(result?.source).toBe("RULE"); expect(result?.confidence).toBeGreaterThan(.95); expect(result?.materials[0].description).toContain("3×1.5");
  });
  it("reicht uneindeutige Texte an AI weiter", () => expect(new PreClassifier().classify({ position: "1.2", shortText: "Installationsgerät komplett" })).toBeNull());
});
