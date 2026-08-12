export class ProviderError extends Error {
  constructor(message: string, public readonly code: "RATE_LIMIT" | "QUOTA" | "AUTH" | "MODEL_UNAVAILABLE" | "NETWORK" | "INVALID_RESPONSE" | "UNKNOWN", public readonly retryAfterMs?: number) {
    super(message);
    this.name = "ProviderError";
  }
}

export class PaidProvidersDisabledError extends Error {
  constructor() {
    super("Die kostenlosen AI-Anbieter konnten diese Position nicht zuverlässig analysieren. Kostenpflichtige Premiumanalyse ist deaktiviert.");
    this.name = "PaidProvidersDisabledError";
  }
}

export function errorFromResponse(response: Response, body: string) {
  if (response.status === 429) return new ProviderError("Rate Limit oder Kontingent erreicht", "RATE_LIMIT", retryAfter(response));
  if (response.status === 401 || response.status === 403) return new ProviderError("Authentifizierung fehlgeschlagen", "AUTH");
  if (response.status === 404) return new ProviderError("Modell oder Endpoint nicht verfügbar", "MODEL_UNAVAILABLE");
  if (/quota|trial expired/i.test(body)) return new ProviderError("Kontingent oder Trial abgelaufen", "QUOTA", 60 * 60_000);
  return new ProviderError(`Provider antwortet mit HTTP ${response.status}`, "UNKNOWN");
}

function retryAfter(response: Response) {
  const value = response.headers.get("retry-after");
  if (!value) return 60_000;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds * 1000 : 60_000;
}
