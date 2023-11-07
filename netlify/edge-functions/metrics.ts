import { Context } from "@netlify/edge-functions";

// Netlify edge functions run in a deno environment, so we have to add the file endings to the imports.
import { addSignature } from "../../src/core/addSignature.ts";
import { conditions } from "../../src/conditions.ts";
import {
  CheckedMetricsDataEvent,
  MetricsSignature,
} from "../../src/interfaces.ts";
// import { logger } from "../../src/core/logger.ts";
// import { LogInfos } from "../../src/shared/logMessages.ts";

export default async (req: Request, context: Context) => {
  try {
    // Read all content of the request
    const body = await req.json();

    // Get the event name and return error response if no known event was found
    const eventName =
      req.headers.get("x-github-event") ||
      req.headers.get("x-deven-event") ||
      "unknown";

    if (eventName === "unknown") {
      return new Response("Unknown event", {
        status: 500,
      });
    }

    // Add event name to the event as eventSignature
    const rawEvent = { ...body, eventSignature: eventName };

    // logger.start(
    //   LogInfos.eventReceived,
    //   `${rawEvent.eventSignature}${rawEvent.action || ""}` || "unknown"
    // );

    // Create a signed data event
    const signedEvent = await addSignature(rawEvent);
    Object.freeze(signedEvent);

    // Get a list of all metrics that should be collected for the event
    // and add it to the metrics event
    const collectedMetricNames: MetricsSignature[] = [];

    for (const [metricName, condition] of conditions) {
      if (condition(signedEvent)) {
        collectedMetricNames.push(metricName);
      }
    }

    if (collectedMetricNames.length === 0) {
      return new Response("No metric applicable to current event state", {
        status: 500,
      });
    }

    const metricsEvent: CheckedMetricsDataEvent = {
      ...signedEvent,
      metricsToApply: collectedMetricNames,
    };

    // Pass the metrics event to the netlify function with the same name (configured with the same path)
    return context.next(
      new Request(req, { body: JSON.stringify(metricsEvent) })
    );
  } catch (e: any) {
    return new Response(e && e.message ? e.message : e, {
      status: 500,
    });
  }
};

export const config = { path: "/metrics" };
