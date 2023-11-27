# List of collected metrics

- [Metric Envelope](#metric-envelope)
- [Trigger Events](#trigger-events)
  - [`check-suite` (GitHub Event)](#check-suite-github-event)
  - [`deployment` (GitHub Event)](#deployment-github-event)
  - [`deven-tooling-usage` (Custom Event)](#deven-tooling-usage-custom-event)
  - [`pull-request` (GitHub event)](#pull-request-github-event)
  - [`workflow-job` (GitHub Event)](#workflow-job-github-event)
- [Metrics](#metrics)
  - [`check-suite` for Completed Check Suites](#check-suite-for-completed-check-suites)
  - [`code-review-involvement` for Merged or Closed Pull Requests](#code-review-involvement-for-merged-or-closed-pull-requests)
  - [`CommitsPerPr` for Merged or Closed Pull Requests](#commitsperpr-for-merged-or-closed-pull-requests)
  - [`deployment` for Created Deployments](#deployment-for-created-deployments)
  - [`documentation-updated` for Merged Pull Requests](#documentation-updated-for-merged-pull-requests)
  - [`release-versions` for Merged or Closed Pull Requests](#release-versions-for-merged-or-closed-pull-requests)
  - [`tooling-usage` for a Repository](#tooling-usage-for-a-repository)
  - [`test-coverage` for Completed Workflow Jobs](#test-coverage-for-completed-workflow-jobs)
  - [`workflow-job` for Completed Workflow Jobs](#workflow-job-for-completed-workflow-jobs)

## Metric Envelope

All collected metric data has an "envelope" object containing a `dataEventSignature` that identifies the event trigger, as well es a `metricsSignature` that identifies the kind of metric.

<details><summary>Example JSON (<code>release-versions</code> metric output)</summary>

```json
{
  "created_at": 1679419755468,
  "owner": "deven-org",
  "repo": "telemetry-functions",
  "dataEventSignature": "pull-request",
  "metricsSignature": "release-versions",
  "output": {
    "pull_number": 12,
    "title": {
      "raw": "1.2.1",
      "major": 1,
      "minor": 2,
      "patch": 1,
      "prerelease": [],
      "build": [],
      "version": "1.2.1"
    }
  }
}
```

</details>

Fields:

```ts
type MetricEnvelope<Output extends object> = {
  /** Time that the server started processing the event (UNIX ms) */
  created_at: number;

  /** The GitHub organisation / account that owns the source repo */
  owner: string;

  /** The GitHub repository name */
  repo: string;

  /** The ID of the triggering data-source, e.g. a GitHub event name */
  dataEventSignature: string;

  /** The ID of the collected metric, as defined by the function */
  metricsSignature: string;

  /** The collected data for this metric, see following sections */
  output: Output; // different for each metricsSignature
};
```

## Trigger Events

The following events are the possible triggers for collecting metrics.
Each trigger's name is the respective `dataEventSignature` ID.

### `check-suite` (GitHub Event)

This event occurs when there is activity relating to a check suite.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#check_suite

Metrics:

- [`check-suite` for Completed Check Suites](#check-suite-for-completed-check-suites)

### `deployment` (GitHub Event)

This event occurs when there is activity relating to deployments.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#deployment

Metrics:

- [`deployment` for Created Deployments](#deployment-for-created-deployments)

### `deven-tooling-usage` (Custom Event)

This event may be triggered via a request to the deployed webhook and only identifies a repository. Where & when this should be triggered is TBD.

Metrics:

- [`tooling-usage` for a Repository](#tooling-usage-for-a-repository)

POST Request Header:

```
X-Deven-Event: toolingUsage
```

POST Request Body:

```ts
type ToolingUsagePayload = {
  /** Repository name */
  owner: string;

  /** Repository owner */
  repo: string;
};
```

### `pull-request` (GitHub event)

This event occurs when there is activity on a pull request.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request

Metrics:

- [`code-review-involvement` for Merged or Closed Pull Requests](#code-review-involvement-for-merged-or-closed-pull-requests)
- [`CommitsPerPr` for Merged or Closed Pull Requests](#commitsperpr-for-merged-or-closed-pull-requests)
- [`documentation-updated` for Merged Pull Requests](#documentation-updated-for-merged-pull-requests)
- [`release-versions` for Merged or Closed Pull Requests](#release-versions-for-merged-or-closed-pull-requests)

### `workflow-job` (GitHub Event)

This event occurs when there is activity relating to a job in a GitHub Actions workflow.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_job

Metrics:

- [`test-coverage` for Completed Workflow Jobs](#test-coverage-for-completed-workflow-jobs)
- [`workflow-job` for Completed Workflow Jobs](#workflow-job-for-completed-workflow-jobs)

## Metrics

These are all the different metrics that can currently be collected.

> [!NOTE]
> The fields and example data only describe the `output` part of the metric data. See the [Metric Envelope](#metric-envelope) for how a complete dataset looks like.

### `check-suite` for Completed Check Suites

Triggers:

- [`check-suite` (GitHub Event)](#check-suite-github-event)

Condition, detecting completed check suites:

```ts
payload.action === "completed";
```

GitHub docs on events with action "completed":

> All check runs in a check suite have completed, and a conclusion is available.

<details><summary>Example JSON for check-suite output</summary>

```json
{
  "conclusion": "success",
  "created_at": 1681375410000,
  "updated_at": 1681375458000,
  "duration": 48000,
  "is_app_owner": false,
  "pull_requests": [{ "id": 1297965631 }]
}
```

</details>

Fields:

```ts
type CheckSuiteMetricsOutput = {
  /** Suite conclusion (see GitHub docs) */
  conclusion: string;

  /** Check suite creation time (UNIX ms) */
  created_at: number;

  /** Check suite last updated time (UNIX ms) */
  updated_at: number;

  /** duration in ms between creation and last update */
  duration: number;

  /** Is check suite configured for / sent to a GitHub app? */
  is_app_owner: boolean;

  /** An array of PR IDs that match this check suite */
  pull_requests: Array<{
    /** Pull Request ID */
    id: number;
  }>;
};
```

### `code-review-involvement` for Merged or Closed Pull Requests

Triggers:

- [`pull-request` (GitHub event)](#pull-request-github-event)

Condition, detecting merged or closed pull requests:

```ts
payload.action === "closed";
```

<details><summary>Example JSON for code-review-involvement output</summary>

```json
{
  "pr_id": 279147437,
  "merged": true,
  "created_at": 1697543339000,
  "updated_at": 1697612705000,
  "closed_at": 1697612705000,
  "merged_at": 1697612705000,
  "total_duration": 69366000,
  "created_to_merged_duration": 69366000,
  "updated_to_closed": 0,
  "comments": 2,
  "review_comments": 0,
  "changed_files": 6,
  "has_been_merged_by_author": true,
  "requested_reviewers": 0,
  "requested_teams": 0,
  "packages": {
    "name": "deven-website",
    "version": "0.1.0",
    "description": "This repository contains DEVENs website",
    "main": "docs/index.html",
    "scripts": {
      "start": "NODE_ENV=development eleventy --serve",
      "build": "NODE_ENV=production npx eleventy"
    },
    "repository": {
      "type": "git",
      "url": "git+https://github.com/deven-org/deven-website.git"
    },
    "keywords": [],
    "author": "DEVENorg",
    "license": "MIT License",
    "bugs": {
      "url": "https://github.com/deven-org/deven-website/issues"
    },
    "homepage": "https://github.com/deven-org/deven-website#readme",
    "devDependencies": {
      "@11ty/eleventy": "^2.0.0",
      "@11ty/eleventy-plugin-rss": "^1.2.0",
      "@11ty/eleventy-plugin-syntaxhighlight": "^4.2.0",
      "luxon": "^3.3.0",
      "markdown-it": "^13.0.1",
      "markdown-it-anchor": "^8.6.7",
      "sass": "^1.61.0"
    },
    "dependencies": { "liquidjs": "^10.7.0" }
  }
}
```

</details>

Fields:

```ts
type CodeReviewInvolvementOutput = {
  /** Pull Request ID (not number) */
  pr_id: number;

  /** Was the PR merged or just closed? */
  merged: boolean;

  /** PR creation time (UNIX ms) */
  created_at: number;

  /** PR last updated time (UNIX ms) */
  updated_at: number;

  /** PR closed time (UNIX ms) */
  closed_at: number;

  /** PR merged time (UNIX ms), null if not merged */
  merged_at: number | null;

  /** Duration in ms between created and closed */
  total_duration: number;

  /** Duration in ms between created and merged, null if not merged */
  created_to_merged_duration: number | null;

  /** Duration in ms between last updated and closed */
  updated_to_closed: number;

  /** Number of comments on PR */
  comments: number;

  /** Number of review comments on PR */
  review_comments: number;

  /** Number of changed files */
  changed_files: number;

  /** Is PR author same user as PR merger? */
  has_been_merged_by_author: boolean;

  /** Number of individual reviewers the author requested */
  requested_reviewers: number;

  /** Number of team reviewers the author requested */
  requested_teams: number;

  /**
   * Full contents of package.json in repo root at default branch.
   * Defaults to an empty array if package.json cannot be found (FIXME)
   */
  packages: unknown | [];
};
```

### `CommitsPerPr` for Merged or Closed Pull Requests

Triggers:

- [`pull-request` (GitHub event)](#pull-request-github-event)

Condition, detecting merged or closed Pull Requests:

```ts
payload.action === "closed";
```

<details><summary>Example JSON for CommitsPerPr output</summary>

```json
{
  "pr_id": 279147437,
  "additions": 692,
  "deletions": 417,
  "commits": 2,
  "commit_timestamps": [
    {
      "authored": 1675874104000,
      "committed": null
    },
    {
      "authored": 1675881304000,
      "committed": 1675895704000
    }
  ]
}
```

</details>

Fields:

```ts
type CommitsPerPrOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /** Number of additions (lines) determined by GitHub */
  additions: number;

  /** Number of deletions (lines) determined by GitHub */
  deletions: number;

  /**
   * Number of commits in closed PR
   * -1 if PR commit list cannot be fetched from GitHub
   */
  commits: number;

  /**
   * Timestamps of when commit author/committer created the commit.
   * [] if commit list cannot be fetched from GitHub
   */
  commit_timestamps: {
    /** Time commit was authored (UNIX ms) */
    authored: number | null;

    /** Time commit was authored (UNIX ms) */
    committed: number | null;
  }[];
};
```

### `deployment` for Created Deployments

Triggers:

- [`deployment` (GitHub Event)](#deployment-github-event)

Condition, detecting newly created deployments:

```ts
payload.action === "created";
```

<details><summary>Example JSON for deployment output</summary>

```json
{
  "env": "github-pages",
  "deployTime": 1697612749000,
  "duration": 71000,
  "version": "0.1.0",
  "timeSinceLastDeploy": 1223014
}
```

</details>

Fields:

```ts
type CheckSuiteMetricsOutput = {
  /** Deployment environment name */
  env: string;

  /** Deployment creation time (UNIX ms) */
  deployTime: number;

  /**
   * Duration between deployment creation and last update
   */
  duration: number;

  /**
   * Version field of root package.json in repo default branch.
   * null if the package.json cannot be fetched.
   *
   * NOTE: type is guessed since the json file might contain anything / not include a version
   */
  version: string | null;

  /**
   * Time in ms since last deployment created for the same environment.
   * null if previous deployment creation time cannot be found/fetched.
   */
  timeSinceLastDeploy: number | null;
};
```

### `documentation-updated` for Merged Pull Requests

Triggers:

- [`pull-request` (GitHub event)](#pull-request-github-event)

Expecting that most documentation (especially when documentation-skeleton is used) is done in `.md` files, the metric tracks how many `.md` files have been changed with each pull request.

Condition, detecting merged pull requests:

```ts
payload.action === "created" && payload.pull_request.merged;
```

<details><summary>Example JSON for release-versions output</summary>

```json
{
  "pr_id": 279147437,
  "mdFilesChanged": 3
}
```

</details>

Fields:

```ts
type DocumentationUpdatedOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Number of Markdown files changed in PR
   * This can be inexact for PRs with >100 files changed
   */
  mdFilesChanged: number;
};
```

### `release-versions` for Merged or Closed Pull Requests

Triggers:

- [`pull-request` (GitHub event)](#pull-request-github-event)

Condition, detecting closed Pull Requests:

```ts
payload.action === "closed";
```

<details><summary>Example JSON for release-versions output</summary>

```json
{
  "pr_id": 279147437,
  "title": {
    "raw": "35.0.0",
    "major": 35,
    "minor": 0,
    "patch": 0,
    "prerelease": [],
    "build": [],
    "version": "35.0.0"
  }
}
```

</details>

Fields:

```ts
type ReleaseVersionsOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Version found in PR Title (parsed by semver package coerce function)
   * null if not parseable as semver
   * See semver npm package docs for meaning of contents
   */
  title: null | {
    raw: string;
    major: number;
    minor: number;
    patch: number;
    prerelease: Array<string | number>;
    build: string[];
    version: string;
  };
};
```

### `tooling-usage` for a Repository

Triggers:

- [`deven-tooling-usage` (Custom Event)](#deven-tooling-usage-custom-event)

(No Condition)

<details><summary>Example JSON for tooling-usage output</summary>

```json
{
  "hasValidPackageJson": true,
  "hasDocumentationSkeleton": true,
  "hasDocChapters": true
}
```

</details>

Fields:

```ts
type ToolingUsageOutput = {
  /**
   * Does the target repository's default branch include a
   * deven-skeleton-install.config.json?
   */
  hasDocumentationSkeleton: boolean;

  /** If config was found: the version specified, otherwise undefined */
  documentationSkeletonVersion: string | undefined;
};
```

### `test-coverage` for Completed Workflow Jobs

Triggers:

- [`workflow-job` (GitHub Event)](#workflow-job-github-event)

Condition, detecting completed jobs:

```ts
// Any completed job of any workflow
payload.action === "completed";
```

GitHub docs on events with action "completed":

> A job in a workflow run finished. This event occurs when a job in a workflow is completed, regardless of whether the job was successful or unsuccessful.

<details><summary>Example JSON for test-coverage output</summary>

```json
{
  "id": 12224450936,
  "status": "completed",
  "conclusion": "success",
  "is_workflow_name_about_test": true,
  "has_failed_steps": false,
  "total_tests_duration": 12000,
  "steps_about_test": [
    {
      "name": "Run test",
      "status": "completed",
      "conclusion": "success",
      "number": 6,
      "started_at": 1679580535000,
      "completed_at": 1679580547000,
      "duration": 12000
    }
  ]
}
```

</details>

Fields:

```ts
type TestCoverageOutput = {
  /** GitHub Job ID */
  id: number;

  /** Job status (always "completed" due to condition) */
  status: "completed";

  /** Job conclusion, see GitHub docs */
  conclusion: string;

  /**
   * If the workflow that ran this job seems to be about tests
   * Currently using regex: /test/i
   */
  is_workflow_name_about_test: boolean;

  /** If any job steps that mention tests (same check as above) failed */
  has_failed_steps: boolean;

  /** Duration of all job steps that mention tests (same check as above) */
  total_tests_duration: number;

  /** List of steps that were executed in the job that mention tests (same check as above) */
  steps_about_test: Array<{
    /** Step name */
    name: string;

    /** Step status (always "completed" due to condition) */
    status: "completed";

    /** Step conclusion, see github docs */
    conclusion: string;

    /** Step number */
    number: number;

    /** Step execution start time (UNIX ms) */
    started_at: number;

    /** Step execution completion time (UNIX ms) */
    completed_at: number;

    /** Step duration in ms */
    duration: number;
  }>;
};
```

### `workflow-job` for Completed Workflow Jobs

Triggers:

- [`workflow-job` (GitHub Event)](#workflow-job-github-event)

Condition, detecting completed jobs:

```ts
payload.action === "completed";
```

GitHub docs on events with action "completed":

> A job in a workflow run finished. This event occurs when a job in a workflow is completed, regardless of whether the job was successful or unsuccessful.

<details><summary>Example JSON for workflow-job output</summary>

```json
{
  "created_at": 1697612749000,
  "started_at": 1697612757000,
  "completed_at": 1697612766000,
  "duration": 9000,
  "status": "completed",
  "workflow_name": "pages build and deployment",
  "run_attempt": 1,
  "steps": [
    {
      "name": "Set up job",
      "status": "completed",
      "conclusion": "success",
      "number": 1,
      "started_at": 1697612757000,
      "completed_at": 1697612758000,
      "duration": 1000
    },
    {
      "name": "Deploy to GitHub Pages",
      "status": "completed",
      "conclusion": "success",
      "number": 2,
      "started_at": 1697612758000,
      "completed_at": 1697612764000,
      "duration": 6000
    },
    {
      "name": "Complete job",
      "status": "completed",
      "conclusion": "success",
      "number": 3,
      "started_at": 1697612764000,
      "completed_at": 1697612764000,
      "duration": 0
    }
  ]
}
```

</details>

Fields:

```ts
type WorkflowJobOutput = {
  /** Job creation time (UNIX ms) */
  created_at: number;

  /** Job start time (UNIX ms) */
  started_at: number;

  /** Job completion time (UNIX ms) */
  completed_at: number;

  /** Job run duration in ms */
  duration: number;

  /** X Job status (always "completed" due to condition) */
  status: "completed";

  /** The name of the workflow this job was executed in, if there is one */
  workflow_name: string | null;

  /** The workflow run attempt (>1 means it got restarted) */
  run_attempt: number;

  /** List of steps that were executed as part of the job */
  steps: Array<{
    /** Step name */
    name: string;

    /** Step status (always "completed" due to condition) */
    status: "completed";

    /** Step conclusion, see github docs */
    conclusion: string;

    /** Step number */
    number: number;

    /** Step execution start time (UNIX ms) */
    started_at: number;

    /** Step execution completion time (UNIX ms) */
    completed_at: number;

    /** Step duration in ms */
    duration: number;
  }>;
};
```
