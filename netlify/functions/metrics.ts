import { Handler, HandlerEvent } from "@netlify/functions";
import { handler as collectMetricsHandler } from "../../src/handler";
import { RawEvent, TriggerSource } from "../../src/interfaces";
import { LogErrors } from "../../src/shared/log-messages";

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
    // Responding with an error code here lets us easily resend events from GitHub
    return {
      statusCode: 500,
      body: LogErrors.genericServerError,
    };
  }
};
