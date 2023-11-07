import { errorCatcher, ErrorForCatcher, storeData } from "../../src/core";
import { collectMetrics } from "../../src/core/collectMetrics";

export default async (req: Request) => {
  // Read the metrics event (CheckedMetricsDataEvent) from the request
  const body = await req.json();

  try {
    // Collect all metrics that apply to the event
    const collectedMetrics = await collectMetrics(body);

    if (collectedMetrics.length > 0) {
      await storeData(collectedMetrics);

      return new Response("Metrics collected", { status: 200 });
    }
  } catch (e) {
    errorCatcher(e as ErrorForCatcher);
  }
};

export const config = { path: "/metrics" };
