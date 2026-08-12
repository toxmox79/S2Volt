import type { MaterialPosition, PositionAnalysisResult } from "./types";

const cablePattern = /\b(NYM-J|NYM-O|NYY-J|H07V-K)\s*(\d+)\s*[x×]\s*(\d+(?:[,.]\d+)?)\b/i;

export class PreClassifier {
  classify(position: MaterialPosition): PositionAnalysisResult | null {
    const text = `${position.shortText} ${position.longText ?? ""}`;
    const cable = cablePattern.exec(text);
    if (cable) {
      return { position: position.position, materials: [{ description: `${cable[1].toUpperCase()} ${cable[2]}×${cable[3].replace(",", ".")} mm²`, quantity: position.quantity, unit: position.unit }], confidence: 0.98, reasoning: "Eindeutige Kabelbezeichnung deterministisch erkannt.", source: "RULE" };
    }
    return null;
  }

  partition(positions: MaterialPosition[]) {
    const deterministic: PositionAnalysisResult[] = []; const unresolved: MaterialPosition[] = [];
    for (const position of positions) { const result = this.classify(position); result ? deterministic.push(result) : unresolved.push(position); }
    return { deterministic, unresolved };
  }
}
