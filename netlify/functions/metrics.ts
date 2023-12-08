import { Handler, HandlerEvent } from "@netlify/functions";
import { handler as collectMetricsHandler } from "../../src/handler";
import { RawEvent, TriggerSource } from "../../src/interfaces";

const headerSourceMap: Record<string, TriggerSource> = {
  ["x-github-event"]: TriggerSource.Github,
  ["x-deven-event"]: TriggerSource.Deven,
};

function identifySourceAndEvent(
  headers: HandlerEvent["headers"]
): Pick<RawEvent, "source" | "sourceEventSignature"> {
  for (const [headerName, source] of Object.entries(headerSourceMap)) {
    const sourceEventSignature = headers[headerName];

    if (sourceEventSignature) {
      return { source, sourceEventSignature };
    }
  }

  return {
    source: TriggerSource.Unknown,
    sourceEventSignature: "unknown",
  };
}

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const rawEvent: RawEvent = {
      payload: event.body ? JSON.parse(event.body) : null,
      ...identifySourceAndEvent(event.headers),
    };

    await collectMetricsHandler(rawEvent);

    return { statusCode: 204 };
  } catch (e: unknown) {
    return {
      statusCode: 500,
      body:
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof e.message === "string"
          ? e.message
          : "server error",
    };
  }
};
