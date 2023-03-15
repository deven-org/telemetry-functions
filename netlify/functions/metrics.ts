import { Handler, HandlerEvent } from "@netlify/functions";
import { handler as collectMetricsHandler } from "../../src/handler";

const getEventBody = (event) => JSON.parse(String(event.body));

const handler: Handler = async (event: HandlerEvent) => {
  try {
    const eventSignature = event.headers["x-github-event"] || "unknown";
    const body = getEventBody(event);
    await collectMetricsHandler({ ...body, eventSignature });
    return {
      statusCode: 200,
      body: "success",
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: e && e.message ? e.message : e,
    };
  }
};

export { handler };
