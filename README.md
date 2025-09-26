# telemetry-functions

[![Issues](https://img.shields.io/github/issues-raw/deven-org/telemetry-functions.svg?maxAge=25000)](https://github.com/deven-org/telemetry-functions/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/deven-org/telemetry-functions.svg?style=flat)](https://github.com/deven-org/telemetry-functions/pulls)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat)](./docs/CODE_OF_CONDUCT.md)  
[![GitHub contributors](https://img.shields.io/github/contributors/deven-org/telemetry-functions.svg?style=flat)](https://github.com/deven-org/telemetry-functions/)

## Contents

- [telemetry-functions](#telemetry-functions)
  - [Contents](#contents)
  - [Introduction](#introduction)
  - [Requirements](#requirements)
  - [How to start](#how-to-start)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Setup](#setup)
    - [Usage with manual triggering](#usage-with-manual-triggering)
    - [Usage with GitHub triggers](#usage-with-github-triggers)
  - [How to test](#how-to-test)
  - [Contributing](#contributing)
  - [License](#license)
  - [Quick start](#quick-start)
  - [Supported metrics](#supported-metrics)
  - [Deploy to AWS (quick steps)](#deploy-to-aws-quick-steps)

## Introduction

Telemetry-Functions is the middle layer of the DEVEN Telemetry project, which is designed to collect anonymized, automized metrics using Git SaaS based bots to inform about how teams can improve development retention, productivity and satisfaction for more effectiveness. Telemetry-functions serves as the bridge between the Github OAuth App, which allows access to the raw data, and the private data repository, where the collected data is stored.

### Architecture Overview

At a glance:

- Incoming events (primarily GitHub webhooks) are received via HTTP.
- Events are normalized and matched against metric conditions.
- Matching collectors fetch/transform data and emit `MetricData` datasets.
- Datasets are stored as JSON files in a GitHub data repository (one file per dataset).

Entry points:
- AWS: API Gateway → Lambda (`aws/lambda/handler.ts`) validates signature and loads secrets from AWS Systems Manager; forwards to core handler.
- Netlify (dev): local function (`netlify/functions/metrics.ts`) for manual/local testing; forwards to core handler.

Core flow (`src/handler.ts`):
- Add internal signature for the event, collect metrics (`src/core/collect-metrics.ts`), then persist (`src/core/store-data.ts`).

For a deeper dive, see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`docs/METRICS.md`](./docs/METRICS.md).

## Requirements

This project is a Node.js package. You need Node version 18 or higher in order to run it. (for more information check out the Node.js documentation [here](https://nodejs.org/en/docs/)).

## How to start

### Prerequisites

If you don't have NPM installed, please install it first.

- npm

  ```sh
  npm install npm@latest -g
  ```

In addition, you'll need to log in to Github in your browser.

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/deven-org/telemetry-functions.git
   ```

2. In the command line, navigate to the project directory.
3. Install NPM packages

   ```sh
   npm install
   ```

### Setup

1. Open the `env.template` file and copy the list of environment variables and their default values. These include:

- REPO_NAME
- REPO_OWNER
- REPO_PATH
- TARGET_BRANCH
- GITHUB_ACCESS_TOKEN
- COMMITTER_NAME
- COMMITTER_EMAIL
- AUTHOR_NAME
- AUTHOR_EMAIL
- CONFLICT_RETRIES

2. Create a new file in the root directory named `.env` and paste the list of environment variables in, exactly as it appears in the env.template file.

### Usage with manual triggering

1. In the command line, start the Netlify function with:

```sh
npm run dev:netlify
```

This way you can test the netlify function and manually send events to the
`http://localhost:9999/.netlify/functions/metrics`, e.g. using the provided
Postman collection.

### Usage with GitHub triggers

> [!WARNING]
> Since this method reads and writes actual GitHub data, _channelled through a
> third-party service_, make sure you don't add the webhook to repositories with
> sensitive or private data. Also don't allow access to such repos using the
> configured tokens!

Alternatively, if you set up valid tokens (one for a repo to write into, and one
for reading from source repositories), you can test the function as it would run
in production by running

```sh
npm run dev
```

This will both start the function as above, and also create a webhook proxy
using [Smee](https://smee.io) as recommended by GitHub.
That will forward events sent to a newly created, publically reachable, URL to
your local function instance.
The webhook URL is logged to the terminal, so that you can configure it for the
source organisation or repo.

## Security

- AWS path validates GitHub webhook requests using `x-hub-signature-256` and a secret stored in AWS Systems Manager. Use this in production.
- Netlify local dev path is intended for testing and does not validate GitHub signatures. Do not expose this publicly.

Review deployment and secret guidance in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Environment variables

Configure via `.env` (local) or provider-specific mechanisms (AWS SSM for secrets). Key variables include:

- `REPO_OWNER` / `REPO_NAME` / `REPO_PATH` / `TARGET_BRANCH`: Target data repository and folder structure for stored metrics.
- `GITHUB_ACCESS_TOKEN`: Local/dev token for GitHub API access (source reads). In AWS, tokens are loaded from SSM instead.
- `AUTHOR_NAME` / `AUTHOR_EMAIL`: Optional author metadata for commit creation.
- `COMMITTER_NAME` / `COMMITTER_EMAIL`: Optional committer metadata for commit creation.
- `CONFLICT_RETRIES`: Number of retries when a non-forced ref update conflicts (e.g., `0`, `2`, `-1` to skip storing in dev).

On AWS, set env vars to the parameter names and place actual secrets in SSM (see `aws/shared/env-vars.ts` and [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)).

## Data storage format

Each collected dataset is written to the data repository as a plaintext JSON file at:

```
{REPO_PATH}/{owner}/{repo}/{metric_signature}/{created_at}.json
```

Minimal example content:

```json
{
  "owner": "example-org",
  "repo": "example-repo",
  "metric_signature": "test-coverage",
  "trigger_event_signature": "workflow_job.completed",
  "created_at": "2024-01-01T12:34:56.000Z",
  "data": { /* metric-specific fields */ }
}
```

See [`docs/METRICS.md`](./docs/METRICS.md) for per-metric details.

## How to test

The project test suite is run with

```sh
   npm test
```

While developing, it may be more convenient to run tests automatically when project files are updated. This can be run with

```sh
  npm test:dev
```

## Contributing

Contributions are welcome! Please see the [contribution guidelines](./docs/CONTRIBUTE.md) for more information. Also check [`docs/GET_STARTED.md`](./docs/GET_STARTED.md) and [`docs/TESTING.md`](./docs/TESTING.md).

## License

Telemetry Functions is MIT licensed.

## Quick start

Local development with Netlify function and webhook proxy:

```sh
npm install
npm run dev
```

This starts the local function on port `9999` and a Smee webhook proxy. The terminal logs the public webhook URL you can configure on GitHub. For manual requests without the proxy, just run:

```sh
npm run dev:netlify
```

Run tests:

```sh
npm test
```

Watch tests:

```sh
npm run test:dev
```

## Supported metrics

High-level list of metric modules and their primary triggers. See [`docs/METRICS.md`](./docs/METRICS.md) for details and examples.

| Metric | Trigger(s) |
| --- | --- |
| check-suite | `github::check_suite` |
| code-review-involvement | `github::pull_request` |
| commits-per-pr | `github::pull_request` |
| deployments | `github::deployment` |
| documentation-updated | `github::pull_request` |
| release-versions | `github::create` |
| test-coverage | `github::workflow_job` |
| workflow-job | `github::workflow_job` |
| tooling-usage | `deven::tooling-usage` |

## Deploy to AWS (quick steps)

For full instructions, see [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md). Summary:

1. Provision infra (API Gateway + Lambda) via CDK:

   ```sh
   npm run cdk bootstrap
   npm run cdk deploy
   ```

2. Create the following SSM Parameter Store entries and put the secrets as values (enable decryption where applicable):

   - `GITHUB_WEBHOOK_SECRET_PARAM`: the GitHub webhook secret used for signature validation.
   - `SOURCE_REPO_ACCESS_TOKEN_PARAM`: token to read source repository data.
   - `DATA_REPO_ACCESS_TOKEN_PARAM`: token to write metric JSON files to the data repository.

3. Set the Lambda environment variables to the SSM parameter names above (these keys are already used by the Lambda code):

   - `GITHUB_WEBHOOK_SECRET_PARAM`
   - `SOURCE_REPO_ACCESS_TOKEN_PARAM`
   - `DATA_REPO_ACCESS_TOKEN_PARAM`

4. Configure your GitHub webhook to POST to the API Gateway endpoint, send only the required events, and set the same webhook secret.

5. Verify by sending a test delivery from GitHub; Lambda should return 204 when accepted.
