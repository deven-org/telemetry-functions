import { decode } from "js-base64";

export type JsonFileRequestResult =
  | { variant: "unexpected-error"; error: unknown }
  | { variant: "missing" }
  | { variant: "unparsable" }
  | { variant: "parsable"; content: Record<string, unknown> };

type OctokitFileResponseShape = {
  data:
    | unknown[]
    | { type: "submodule" | "symlink" }
    | { type: "file"; content: string };
};

export async function octokitJsonResponseHandler(
  responsePromise: Promise<OctokitFileResponseShape>
): Promise<JsonFileRequestResult> {
  let response: OctokitFileResponseShape;

  try {
    response = await responsePromise;
  } catch (e: unknown) {
    // Using instanceof with the exact RequestError class would lead to issues
    // if there are multiple instances of the dependency (and hard-to-test code)
    if (e instanceof Error && "status" in e && e.status === 404) {
      return { variant: "missing" };
    }

    return { variant: "unexpected-error", error: e };
  }

  if (Array.isArray(response.data) || response.data.type !== "file") {
    return { variant: "missing" };
  }

  let content: unknown;
  try {
    content = JSON.parse(decode(response.data.content));
  } catch (_: unknown) {
    return { variant: "unparsable" };
  }

  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return { variant: "unparsable" };
  }

  // only possibility for json content at this point
  return { variant: "parsable", content: content as Record<string, unknown> };
}
