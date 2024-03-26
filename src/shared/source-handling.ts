import { createHmac, timingSafeEqual } from "crypto";
import { handler as collectMetricsHandler } from "../handler";
import { RawEvent, TriggerSource, headerSourceMap } from "../interfaces";
import { LogErrors } from "./log-messages";

interface EventHeaders {
  [name: string]: string | undefined;
}

const GITHUB_SIGNATURE_HEADER = "x-hub-signature-256";

export function identifySourceAndEvent(
  headers: EventHeaders
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

export function validateRequest(
  headers: EventHeaders,
  body: string,
  webhookSecret: string
) {
  // Github signature header must be present
  if (!headers || !headers[GITHUB_SIGNATURE_HEADER]) {
    throw new HTMLError(LogErrors.badRequestError, 400);
  }
  const githubSignature = headers[GITHUB_SIGNATURE_HEADER];

  // Verify this request by checking its signature
  if (!verifyGithubSignature(githubSignature, body, webhookSecret)) {
    throw new HTMLError(LogErrors.forbiddenRequestError, 401);
  }
}

function verifyGithubSignature(
  githubSignature: string,
  body: string,
  webhookSecret: string
): boolean {
  const signature = createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  const trusted = Buffer.from(`sha256=${signature}`, "ascii");
  const untrusted = Buffer.from(githubSignature, "ascii");
  return timingSafeEqual(trusted, untrusted);
}

export async function handleEvent(
  eventHeaders: EventHeaders,
  eventBody: string,
  githubAccessTokenSourceRepo: string,
  githubAccessTokenDataRepo: string
): Promise<void> {
  const eventHeader = identifySourceAndEvent(eventHeaders);

  if (eventHeader.source === TriggerSource.Unknown) {
    throw new HTMLError(LogErrors.unknownSource, 412);
  }

  const rawEvent: RawEvent = {
    payload: JSON.parse(eventBody),
    source: eventHeader.source,
    sourceEventSignature: eventHeader.sourceEventSignature,
  };

  await collectMetricsHandler(
    rawEvent,
    githubAccessTokenSourceRepo,
    githubAccessTokenDataRepo
  );
}

export class HTMLError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "HTMLError";
    this.statusCode = statusCode;
  }

  statusCode: number;
}
