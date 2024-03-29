# List of collected metrics

- [List of collected metrics](#list-of-collected-metrics)
  - [Metric Envelope](#metric-envelope)
  - [Trigger Events](#trigger-events)
    - [`github::check_suite`](#githubcheck_suite)
    - [`github::create`](#githubcreate)
    - [`github::deployment`](#githubdeployment)
    - [`github::pull_request`](#githubpull_request)
    - [`github::workflow_job`](#githubworkflow_job)
    - [`deven::tooling-usage`](#deventooling-usage)
  - [Metrics](#metrics)
    - [`check-suite` for Completed Check Suites](#check-suite-for-completed-check-suites)
    - [`code-review-involvement` for Merged or Closed Pull Requests](#code-review-involvement-for-merged-or-closed-pull-requests)
    - [`CommitsPerPr` for Merged Pull Requests](#commitsperpr-for-merged-pull-requests)
    - [`deployment` for Created Deployments](#deployment-for-created-deployments)
    - [`documentation-updated` for Merged Pull Requests](#documentation-updated-for-merged-pull-requests)
    - [`release-versions` for created Tags with valid semver version](#release-versions-for-created-tags-with-valid-semver-version)
    - [`tooling-usage` for a Repository](#tooling-usage-for-a-repository)
    - [`test-coverage` for Completed Workflow Jobs mentioning tests](#test-coverage-for-completed-workflow-jobs-mentioning-tests)
    - [`workflow-job` for Completed Workflow Jobs](#workflow-job-for-completed-workflow-jobs)

## Metric Envelope

All collected metric data has an "envelope" object containing a `trigger_event_signature` that identifies the event trigger, as well es a `metric_signature` that identifies the kind of metric.

<details><summary>Example JSON (<code>release-versions</code> metric output)</summary>

```json
{
  "created_at": 1679419755468,
  "owner": "deven-org",
  "repo": "telemetry-functions",
  "trigger_event_signature": "github::pull_request",
  "metric_signature": "release-versions",
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
  trigger_event_signature: string;

  /** The ID of the collected metric, as defined by the function */
  metric_signature: string;

  /** The status of the metric collection, depending on the success of all related API calls */
  status: "success" | "networkError";

  /** The collected data for this metric, see following sections */
  output: Output; // different for each metric_signature
};
```

## Trigger Events

The following events are the possible triggers for collecting metrics.
Each trigger's name is the respective `trigger_event_signature` ID.

### `github::check_suite`

This event occurs when there is activity relating to a check suite.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#check_suite

Metrics:

- [`check-suite` for Completed Check Suites](#check-suite-for-completed-check-suites)

### `github::create`

This event occurs when a Git branch or tag is created.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#create

Metrics:

- [`release-versions` for created Tags with valid semver version](#release-versions-for-merged-or-closed-pull-requests)

### `github::deployment`

This event occurs when there is activity relating to deployments.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#deployment

Metrics:

- [`deployment` for Created Deployments](#deployment-for-created-deployments)

### `github::pull_request`

This event occurs when there is activity on a pull request.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request

Metrics:

- [`code-review-involvement` for Merged or Closed Pull Requests](#code-review-involvement-for-merged-or-closed-pull-requests)
- [`CommitsPerPr` for Merged Pull Requests](#commitsperpr-for-merged-pull-requests)
- [`documentation-updated` for Merged Pull Requests](#documentation-updated-for-merged-pull-requests)

### `github::workflow_job`

This event occurs when there is activity relating to a job in a GitHub Actions workflow.

Event Docs: https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_job

Metrics:

- [`test-coverage` for Completed Workflow Jobs mentioning tests](#test-coverage-for-completed-workflow-jobs-mentioning-tests)
- [`workflow-job` for Completed Workflow Jobs](#workflow-job-for-completed-workflow-jobs)

### `deven::tooling-usage`

This event may be triggered via a request to the deployed webhook and only identifies a repository. Where & when this should be triggered is TBD.

Metrics:

- [`tooling-usage` for a Repository](#tooling-usage-for-a-repository)

POST Request Header:

```
X-Deven-Event: tooling-usage
```

POST Request Body:

```ts
type ToolingUsageBody = {
  /** Repository name */
  owner: string;

  /** Repository owner */
  repo: string;
};
```

## Metrics

These are all the different metrics that can currently be collected.

> [!NOTE]
> The fields and example data only describe the `output` part of the metric data. See the [Metric Envelope](#metric-envelope) for how a complete dataset looks like.

### `check-suite` for Completed Check Suites

Triggers:

- [`github::check_suite`](#githubcheck_suite)

Condition, detecting completed check suites:

```ts
payload.action === "completed";
```

GitHub docs on events with action "completed":

> All check runs in a check suite have completed, and a conclusion is available.

<details><summary>Example JSON for check-suite output</summary>

```json
{
  "id": 123456789,
  "conclusion": "success",
  "head_sha": "headSHA",
  "created_at": 1681375410000,
  "updated_at": 1681375458000,
  "is_app_owner": false,
  "pull_requests": [{ "id": 1297965631 }]
}
```

</details>

Fields:

```ts
type CheckSuiteMetricsOutput = {
  /** Suite ID (see GitHub docs) */
  id: number;

  /** Suite conclusion (see GitHub docs) */
  conclusion: string;

  /** The SHA of the head commit that is being checked. */
  head_sha: string;

  /** Check suite creation time (UNIX ms) */
  created_at: number;

  /** Check suite last updated time (UNIX ms) */
  updated_at: number;

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

- [`github::pull_request`](#githubpull_request)

Condition, detecting merged or closed pull requests:

```ts
payload.action === "closed";
```

<details><summary>Example JSON for code-review-involvement output</summary>

```json
{
  "pr_id": 279147437,
  "head_sha": "sha-string",
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
  "requested_teams": 0
}
```

</details>

Fields:

```ts
type CodeReviewInvolvementOutput = {
  /** Pull Request ID (not number) */
  pr_id: number;

  /** Sha of the head of the workflow job */
  head_sha: string;

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
};
```

### `CommitsPerPr` for Merged Pull Requests

Triggers:

- [`github::pull_request`](#githubpull_request)

Condition, detecting merged Pull Requests:

```ts
payload.action === "closed" && payload.pull_request.merged;
```

<details><summary>Example JSON for CommitsPerPr output</summary>

```json
{
  "pr_id": 279147437,
  "head_sha": "sha-string",
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

  /** Sha of the head of the workflow job */
  head_sha: string;

  /** Number of additions (lines) determined by GitHub */
  additions: number;

  /** Number of deletions (lines) determined by GitHub */
  deletions: number;

  /**
   * The commits of the PR.
   * null if PR commit list cannot be fetched from GitHub (status: 'networkError')
   */
  commits: null | {
    /**
     * Number of commits in closed PR
     */
    amount: number;

    /**
     * Timestamps of when commit author/committer created the commit.
     */
    commit_timestamps: {
      /** Time commit was authored (UNIX ms) */
      authored: number | null;

      /** Time commit was committed (UNIX ms) */
      committed: number | null;
    }[];
  };
};
```

### `deployment` for Created Deployments

Triggers:

- [`github::deployment`](#githubdeployment)

Condition, detecting newly created deployments:

```ts
payload.action === "created";
```

> [!WARNING]
> The `package_json` field always contains information about the root package
> json of the repo at the state of the commit that was deployed.
> There is no guarantee that the version field has anything to do with the
> deployment. (Consider e.g. monorepos)

<details><summary>Example JSON for deployment output</summary>

```json
{
  "env": "github-pages",
  "deploy_time": 1697612749000,
  "duration": 71000,
  "version": "0.1.0",
  "time_since_last_deploy": 1223014
}
```

</details>

Fields:

```ts
type CheckSuiteMetricsOutput = {
  /** Deployment environment name */
  env: string;

  /** Deployment creation time (UNIX ms) */
  deploy_time: number;

  /**
   * Duration between deployment creation and last update
   */
  duration: number;

  /**
   * Relevant information depending on previous deployments to the current environment.
   * null if the list of deployments cannot be fetched (status: 'networkError')
   */
  environment_deployments: null | {
    /**
     * True if fetching deployments is successful but no previous deployment
     * to the requested environment is found.
     */
    is_initial_deployment: boolean;

    /**
     * Time in ms since last deployment created for the same environment.
     * null if previous deployment creation time cannot be found.
     */
    time_since_last_deploy: number | null;
  };

  /**
   * General information about the package.json.
   * null means the data could not be fetched due to reasons other than the file
   * not existing (status: 'networkError').
   *
   * NOTE: this will always look at the root package json of the repo at the
   * state of the commit that was deployed.
   * There is no guarantee that the version field has anything
   * to do with the deployment
   */
  package_json: null | {
    /** Does the package.json exist */
    exists: boolean;

    /**
     * Is the package.json parsable?
     * null if file doesn't exist
     */
    parsable: null | boolean;

    /**
     * If package.json was found, parsed, and version is string: the version specified
     * Otherwise null
     */
    version: null | string;
  };
};
```

### `documentation-updated` for Merged Pull Requests

Triggers:

- [`github::pull_request`](#githubpull_request)

Expecting that most documentation (especially when documentation-skeleton is used) is done in `.md` files, the metric tracks how many `.md` files have been changed with each pull request.

Condition, detecting merged pull requests:

```ts
payload.action === "closed" && payload.pull_request.merged;
```

<details><summary>Example JSON for release-versions output</summary>

```json
{
  "pr_id": 279147437,
  "md_files_changed": 3,
  "head_sha": "sha-string"
}
```

</details>

Fields:

```ts
type DocumentationUpdatedOutput = {
  /** Pull Request ID (not PR number) */
  pr_id: number;

  /**
   * Data based on the files in the PR.
   * null means the additional data could not be fetched (status: 'networkError')
   */
  pr_files: null | {
    /** Did this PR have >100 files? */
    over_100_files: boolean;

    /**
     * Number of Markdown files changed in PR
     * This can be inexact if over_100_files is true
     */
    md_files_changed: number;
  };

  /** Sha of the head of the workflow job */
  head_sha: string;
};
```

### `release-versions` for created Tags with valid semver version

Triggers:

- [`github::create`](#githubcreate)

Condition, detecting created tag with valid semver version:

```ts
payload.ref_type !== "tag" && semverClean(triggerEvent.payload.ref);
```

<details><summary>Example JSON for release-versions output</summary>

```json
{
  "release_version": {
    "raw": "1.2.3",
    "major": 1,
    "minor": 2,
    "patch": 3,
    "prerelease": [],
    "build": [],
    "version": "1.2.3"
  }
}
```

</details>

Fields:

```ts
/**
 * See semver npm package docs for meaning of contents
 */
type ReleaseVersion = {
  raw: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: Array<string | number>;
  build: string[];
  version: string;
};

type ReleaseVersionsOutput = {
  /**
   * Version found in tag (parsed by semver package)
   */
  release_version: ReleaseVersion;
};
```

### `tooling-usage` for a Repository

Triggers:

- [`deven::tooling-usage`](#deventooling-usage)

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
   * Data based on the target repository's deven-skeleton-install.config.json.
   * null means the data could not be fetched due to reasons other than the file
   * not existing (status: 'networkError').
   */
  documentation_skeleton_config: null | {
    /** Does the config exist */
    exists: boolean;

    /**
     * Is the config parsable?
     * null if file doesn't exist
     */
    parsable: null | boolean;

    /**
     * If config was found, parsed, and version is set: the version specified
     * Otherwise null
     */
    version: null | string;
  };
};
```

### `test-coverage` for Completed Workflow Jobs mentioning tests

Triggers:

- [`github::workflow_job`](#githubworkflow_job)

Condition, detecting completed jobs, that seem to mention tests in their name,
the workflow name, or in the steps:

```ts
const testNameDetection =
  /test|jest|[^j]ava|puppeteer|cypress|selenium|playwright|mocha|jasmine/;

// Any completed job of any workflow
payload.action === "completed" &&
  [
    payload.workflow_job.name,
    payload.workflow_job.workflow_name,
    ...payload.workflow_job.steps.map((step) => step.name),
  ]
    .filter((name): name is string => name !== null)
    .some((name) => testNameDetection.test(name));
```

GitHub docs on events with action "completed":

> A job in a workflow run finished. This event occurs when a job in a workflow is completed, regardless of whether the job was successful or unsuccessful.

<details><summary>Example JSON for test-coverage output</summary>

```json
{
  "id": 12224450936,
  "conclusion": "success",
  "is_workflow_name_about_test": true,
  "has_failed_steps": false,
  "total_tests_duration": 12000,
  "steps_about_test": [
    {
      "name": "Run test",
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

  /** Job conclusion, see github docs */
  conclusion: "success" | "failure" | "cancelled" | "skipped";

  /** If the workflow that ran this job seems to be about tests */
  is_workflow_name_about_test: boolean;

  /** If this job seems to be about tests */
  is_job_name_about_test: boolean;

  /** If any job steps that mention tests failed */
  has_failed_steps: boolean;

  /** Duration of all job steps that mention tests */
  total_tests_duration: number;

  /** List of steps that were executed in the job that mention tests */
  steps_about_test: Array<{
    /** Step name */
    name: string;

    /** Step conclusion, see github docs */
    conclusion: "success" | "failure" | "skipped";

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

- [`github::workflow_job`](#githubworkflow_job)

Condition, detecting completed jobs:

```ts
payload.action === "completed";
```

GitHub docs on events with action "completed":

> A job in a workflow run finished. This event occurs when a job in a workflow is completed, regardless of whether the job was successful or unsuccessful.

<details><summary>Example JSON for workflow-job output</summary>

```json
{
  "id": 12345679,
  "head_sha": "sha-string",
  "created_at": 1697612749000,
  "started_at": 1697612757000,
  "completed_at": 1697612766000,
  "duration": 9000,
  "conclusion": "success",
  "workflow_name": "pages build and deployment",
  "run_attempt": 1,
  "steps": [
    {
      "name": "Set up job",
      "conclusion": "success",
      "number": 1,
      "started_at": 1697612757000,
      "completed_at": 1697612758000,
      "duration": 1000
    },
    {
      "name": "Deploy to GitHub Pages",
      "conclusion": "success",
      "number": 2,
      "started_at": 1697612758000,
      "completed_at": 1697612764000,
      "duration": 6000
    },
    {
      "name": "Complete job",
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
  /** Id of the workflow job */
  id: number;

  /** Sha of the head of the workflow job */
  head_sha: string;

  /** Job creation time (UNIX ms) */
  created_at: number;

  /** Job start time (UNIX ms) */
  started_at: number;

  /** Job completion time (UNIX ms) */
  completed_at: number;

  /** Job run duration in ms */
  duration: number;

  /** Job conclusion, see github docs */
  conclusion: "success" | "failure" | "cancelled" | "skipped";

  /** The name of the workflow this job was executed in, if there is one */
  workflow_name: string | null;

  /** The workflow run attempt (>1 means it got restarted) */
  run_attempt: number;

  /** List of steps that were executed as part of the job */
  steps: Array<{
    /** Step name */
    name: string;

    /** Step conclusion, see github docs */
    conclusion: "success" | "failure" | "skipped";

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
