# telemetry-functions

## Contents

- [telemetry-functions](#telemetry-functions)
  - [Contents](#contents)
- [Introduction](#introduction)
  - [Requirements](#requirements)
  - [How to start](#how-to-start)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Setup](#setup)
    - [Usage](#usage)
  - [How to test](#how-to-test)
  - [Contributing](#contributing)
  - [License](#license)

# Introduction

Telemetry-Functions is the middle layer of the DEVEN Telemetry project, which is designed to collect anonymized, automized metrics using Git SaaS based bots to inform about how teams can improve development retention, productivity and satisfaction for more effectiveness. Telemetry-functions serves as the bridge between the Github OAuth App, which allows access to the raw data, and the private data repository, where the collected data is stored.

## Requirements

This project is a Node.js package. You need Node version 16 or higher in order to run it. (for more information check out the Node.js documentation[here](https://nodejs.org/en/docs/))

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

1. Open the env.template file and copy the list of environment variables and their default values. These include:

- REPO_NAME
- REPO_OWNER
- REPO_PATH
- TARGET_BRANCH
- GITHUB_ACCESS_TOKEN
- COMMITTER_NAM
- COMMITTER_EMAIL
- AUTHOR_NAME
- AUTHOR_EMAIL

2. Create a new file in the root directory named `.env` and paste the list of environment variables in, exactly as it appears in the env.template file.

### Usage

1. In the command line, start the Netlify function with:

```sh
  netlify function serve
```

## How to test

The project test suite is run with

```sh
   npm test
```

While developing, it may be more convenient to run tests automatically when project files are updated. This can be run with

```sh
$ npm test:dev
```

## Contributing

Contributions are welcome! Please see the [contribution guidelines](./doc/CONTRIBUTE.md) for more information.

## License

Telemetry Functions is MIT licensed.
