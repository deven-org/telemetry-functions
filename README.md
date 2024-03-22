# telemetry-functions

[![Issues](https://img.shields.io/github/issues-raw/deven-org/telemetry-functions.svg?maxAge=25000)](https://github.com/deven-org/telemetry-functions/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/deven-org/telemetry-functions.svg?style=flat)](https://github.com/deven-org/telemetry-functions/pulls)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat)](https://github.com/deven-org/telemetry-functions/blob/main/doc/CODEOFCONDUCT.md)  
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

## Introduction

Telemetry-Functions is the middle layer of the DEVEN Telemetry project, which is designed to collect anonymized, automized metrics using Git SaaS based bots to inform about how teams can improve development retention, productivity and satisfaction for more effectiveness. Telemetry-functions serves as the bridge between the Github OAuth App, which allows access to the raw data, and the private data repository, where the collected data is stored.

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
Variable                  | Required | Note                   | Example
------------------------- | -------- | ---------------------- | ----------------------
REPO_NAME                 | yes      | name of the repository | telemetry-data
REPO_OWNER                | yes      | owner/organization     | deven-org
REPO_PATH                 | yes      | data repo              | raw-data
TARGET_BRANCH             | yes      | branch to commit data  | main
REPO_WRITE_ACCESS_TOKEN   | yes      | only used locally as env var | [token creation](./docs/ARCHITECTURE.md#repo_write_access_token)
GITHUB_ACCESS_TOKEN       | yes      | only used locally as env var | [token creation](./docs/ARCHITECTURE.md#github_access_token)
COMMITTER_NAME            | no       | User name of commit creator | Jay Doe
COMMITTER_EMAIL           | no       | User email of commit creator | jay.doe@telemetry.xyz
AUTHOR_NAME               | no       | User name of commit author | Jay Doe
AUTHOR_EMAIL              | no       | User email of commit author | jay.doe@telemetry.xyz
CONFLICT_RETRIES          | no       | Number of retries, minimum of 3 recommended | 3

2. Create a new file in the root directory named `.env` and paste the list of environment variables in, exactly as it appears in the env.template file.

### Usage with manual triggering

1. In the command line, deploy local changes to an AWS test environment with:

```sh
npm run dev
```

This way you can test the lambda function and manually send events to the returned URL from the command above, e.g. using the provided
Postman collection.

Once the test environment is not needed anymore the following command needs to be called to delete the test environment:

```sh
npm run dev:destroy
```

To use the test environment the secrets also need to be configured for it, please follow the guide in the [deployment documentation](./docs/DEPLOYMENT.md#secrets).

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

Contributions are welcome! Please see the [contribution guidelines](./doc/CONTRIBUTE.md) for more information.

## License

Telemetry Functions is MIT licensed.
