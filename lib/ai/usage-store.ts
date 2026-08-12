export type UsageEvent = { providerId: string; success: boolean; inputTokens: number; outputTokens: number; estimatedCostEur: number; latencyMs: number; errorCode?: string; createdAt: Date };

class UsageStore {
  private events: UsageEvent[] = [];
  record(event: UsageEvent) { this.events.push(event); if (this.events.length > 10_000) this.events.shift(); }
  list() { return [...this.events]; }
  summary() {
    return this.events.reduce<Record<string, { requests: number; success: number; errors: number; tokens: number; cost: number; latencyMs: number }>>((all, event) => {
      const item = all[event.providerId] ??= { requests: 0, success: 0, errors: 0, tokens: 0, cost: 0, latencyMs: 0 };
      item.requests++; event.success ? item.success++ : item.errors++; item.tokens += event.inputTokens + event.outputTokens; item.cost += event.estimatedCostEur; item.latencyMs += event.latencyMs;
      return all;
    }, {});
  }
}

export const usageStore = new UsageStore();
