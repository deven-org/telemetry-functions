import { Handler, HandlerEvent } from "@netlify/functions";
import { handler as collectMetricsHandler } from "../../src/handler";
import {
  path,
  pipe,
  filter,
  pick,
  isNotNil,
  values,
  head,
  either,
  always,
  assoc,
} from "ramda";
import { RawEvent } from "../../src/interfaces";

const handler: Handler = async (event: HandlerEvent) => {
  try {
    const getBodyFromHandlerEvent: (HandlerEvent) => string = pipe(
      path(["body"]),
      String,
      JSON.parse
    );

    const getEventNameFromHandlerEvent: (HandlerEvent) => string = pipe(
      path(["headers"]),
      pick(["x-github-event", "x-deven-event"]),
      filter(isNotNil),
      values,
      either(head, always("unknown"))
    );

    const getRawEventFromHandlerEvent: (HandlerEvent) => RawEvent = pipe(
      getBodyFromHandlerEvent,
      assoc("eventSignature", getEventNameFromHandlerEvent(event))
    );

    const rawEvent: RawEvent = getRawEventFromHandlerEvent(event);

    const result: unknown = await collectMetricsHandler(rawEvent);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: e && e.message ? e.message : e,
    };
  }
};

export { handler };
