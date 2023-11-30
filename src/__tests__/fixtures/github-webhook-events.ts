import exampleDataJson from "@octokit/webhooks-examples/api.github.com/index.json";
import {
  CreateEvent,
  PullRequestClosedEvent,
  PullRequestEvent,
  WebhookEvent,
  WebhookEventMap,
  WebhookEventName,
} from "@octokit/webhooks-types";
import { clone } from "ramda";
import { clean as semverClean } from "semver";

type ExampleData = Array<{
  name: WebhookEventName;
  examples: WebhookEvent[]; // hard to type more specifically here, we'll assert it later
}>;

// The ramda function is useful but is missing typings
type Clone = <T>(source: T) => T;

const patchedExampleData = addPatches(exampleDataJson as ExampleData);

export function getWebhookEventFixtureList<T extends WebhookEventName>(
  eventName: T,
  predicate?: (data: WebhookEventMap[T]) => unknown
): Array<WebhookEventMap[T]> {
  const eventExamples = patchedExampleData.find(
    (event) => event.name === eventName
  )?.examples as undefined | Array<WebhookEventMap[T]>;
  const examples = predicate ? eventExamples?.filter(predicate) : eventExamples;

  if (!examples || examples.length === 0) {
    throw new Error(
      `Test failed because it could not find a fitting examples of ${eventName} in the dataset provided by @octokit/webhooks-examples.`
    );
  }

  // Deep-cloned so that the test cannot accidentally alter the source data.
  return (clone as Clone)(examples);
}

export function getWebhookEventFixture<T extends WebhookEventName>(
  eventName: T,
  predicate?: (data: WebhookEventMap[T]) => unknown
): WebhookEventMap[T] {
  return getWebhookEventFixtureList<T>(eventName, predicate)[0];
}

// Applies patches to the dataset
function addPatches(data: ExampleData): ExampleData {
  // The deep clone prevents the imported data to be mutated globally for the runtime
  let clonedData = (clone as Clone)(data);

  clonedData = addPullRequestPatches(clonedData);
  clonedData = addCreatePatches(clonedData);

  return clonedData;
}

function addPullRequestPatches(data: ExampleData): ExampleData {
  // Missing data:
  //   pull_request events with action="closed" and pull_request.merged=true
  // Patch approach:
  //   copy events with pull_request.merged=false and patch them to say they
  //   were merged by the PR author at the time the PR got closed.

  const prData = data.find((e) => e.name === "pull_request")?.examples as
    | undefined
    | PullRequestEvent[];

  if (!prData) {
    return data;
  }

  if (prData.some((ex) => ex.action === "closed" && ex.pull_request.merged)) {
    console.warn(
      "@octokit/webhooks-examples now includes examples of merged PRs - manual patching is unnecessary"
    );
  }

  const unmergedExamples = prData.filter(
    (ex): ex is PullRequestClosedEvent =>
      ex.action === "closed" && !ex.pull_request.merged
  );

  for (const unmergedExample of unmergedExamples) {
    const mergedExample = (clone as Clone)(unmergedExample);

    mergedExample.pull_request.merged = true;
    mergedExample.pull_request.merged_at = mergedExample.pull_request.closed_at;
    mergedExample.pull_request.merged_by = mergedExample.pull_request.user;

    prData.push(mergedExample);
  }

  return data;
}

function addCreatePatches(data: ExampleData): ExampleData {
  // Missing data:
  //   create events with ref_type="tag" and ref as valid semver string
  // Patch approach:
  //   copy events with ref_type="tag" and patch
  //   ref with a valid semver string

  const createEventData = data.find((e) => e.name === "create")?.examples as
    | undefined
    | CreateEvent[];

  if (!createEventData) {
    return data;
  }

  if (
    createEventData.some(
      (ex) => ex.ref_type === "tag" && semverClean(ex.ref) !== null
    )
  ) {
    console.warn(
      "@octokit/webhooks-examples now includes examples of create tag events with semver string - manual patching is unnecessary"
    );
  }

  const unmergedExamples = createEventData.filter(
    (ex): ex is CreateEvent => ex.ref_type === "tag"
  );

  for (const unmergedExample of unmergedExamples) {
    const mergedExample = (clone as Clone)(unmergedExample);

    mergedExample.ref = "v1.2.3";

    createEventData.push(mergedExample);
  }

  return data;
}
