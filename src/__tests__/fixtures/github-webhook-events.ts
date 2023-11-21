import exampleDataJson from "@octokit/webhooks-examples/api.github.com/index.json";
import { WebhookEventMap, WebhookEventName } from "@octokit/webhooks-types";
import { clone } from "ramda";

export function getWebhookEventFixtureList<T extends WebhookEventName>(
  eventName: T,
  predicate?: (data: WebhookEventMap[T]) => unknown
): Array<WebhookEventMap[T]> {
  const eventExamples = (exampleDataJson as any[]).find(
    (event) => event.name === eventName
  )?.examples as undefined | Array<WebhookEventMap[T]>;
  const examples = predicate ? eventExamples?.filter(predicate) : eventExamples;

  if (!examples || examples.length === 0) {
    throw new Error(
      `Test failed because it could not find a fitting examples of ${eventName} in the dataset provided by @octokit/webhooks-examples.`
    );
  }

  return clone(examples) as Array<WebhookEventMap[T]>;
}

export function getWebhookEventFixture<T extends WebhookEventName>(
  eventName: T,
  predicate?: (data: WebhookEventMap[T]) => unknown
): WebhookEventMap[T] {
  return getWebhookEventFixtureList<T>(eventName, predicate)[0];
}
