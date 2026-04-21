import type { PipelineStep } from "./types";

/**
 * Per-request step logger. Captures {name, durationMs, meta, status} so the
 * UI can visualize the pipeline. Also logs to stdout so a prod deploy can
 * ship to Datadog / Logtail without change.
 */
export class RequestLogger {
  readonly requestId: string;
  private steps: PipelineStep[] = [];
  private startAt = Date.now();

  constructor(requestId?: string) {
    this.requestId = requestId ?? Math.random().toString(36).slice(2, 10);
  }

  async step<T>(
    name: string,
    fn: () => Promise<T> | T,
    meta?: Record<string, unknown>
  ): Promise<T> {
    const t0 = Date.now();
    try {
      const value = await fn();
      const durationMs = Date.now() - t0;
      this.steps.push({ name, status: "ok", durationMs, meta });
      console.log(
        `[ai:${this.requestId}] ${name} ok ${durationMs}ms`,
        meta ?? ""
      );
      return value;
    } catch (err) {
      const durationMs = Date.now() - t0;
      this.steps.push({
        name,
        status: "error",
        durationMs,
        detail: (err as Error).message,
      });
      console.error(
        `[ai:${this.requestId}] ${name} error ${durationMs}ms`,
        err
      );
      throw err;
    }
  }

  skip(name: string, detail: string) {
    this.steps.push({ name, status: "skipped", durationMs: 0, detail });
  }

  getSteps(): PipelineStep[] {
    return [...this.steps];
  }

  totalMs(): number {
    return Date.now() - this.startAt;
  }
}
