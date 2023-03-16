# Welcome to our docs contributing guide <!-- omit in toc -->

Thank you for taking the time to contribute to our project! We sincerely appreciate it. :sparkles: Before you start, please read our Code of Conduct to maintain an approachable and respectable community.

## Chapters

- [Chapters](#chapters)
- [New contributor guide](#new-contributor-guide)
- [Getting started](#getting-started)
  - [:file_folder: File Structure](#file_folder-file-structure)
- [Issues](#issues)
  - [Create a new issue](#create-a-new-issue)
  - [Solving an Issue](#solving-an-issue)
    - [Prerequisites](#prerequisites)
    - [Commits](#commits)
    - [Branch](#branch)

## New contributor guide

Before you get started, read the README to get an overview of the project. Here are some resources to help you begin contributing:

- [How to install git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [How to handle repositories](https://docs.gitlab.com/ee/user/project/repository/)
- [Creating an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue)
- [Creating merge requests](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)

## Getting started

### :file_folder: File Structure

Our project has the following file structure:

    .
    └── .github           // GitLab CI/CD pipeline
    └── .netlify          // Dist folder created by Netlify CLI
    └── src
        └── core          // Core modules
        └── metrics       // Metrics collection modules
        └── shared        // Global configuration and log messages
        └── doc           // the documentation skeleton
    └── postman           // Postman collections
    └── netlify           // Netlify Serverless functions
    └── .env              // Env variables
    └── CHANGELOG.md      // This file is automatically created by the release stage of the main    pipeline. Please don't touch it.

## Issues

### Create a new issue

If you encounter a problem with the tool or documentation, please [first search if a related issue exists](https://github.com/deven-org/telemetry-functionss/issues) . If there is no existing issue, please create one using the Issues tab.

To write a useful issue, please ensure it:
If you spot a problem with the tool or the documentation, please [search if an issue already exists](https://github.com/deven-org/telemetry-functionss/issues). If a related issue doesn't exist, you can open a new issue using the same page.

<details>
<summary>To write a useful issue, please ensure it:</summary>
<br />

- It should be _reproducible_. It should contain all the istructions needed to reproduce the same outcome.

- It should be _specific_. It's important that it addresses one specific problem.

</details>

### Solving an Issue

Browse our [existing issues](https://github.com/deven-org/telemetry-functionss/issues) to find one that interests you. If you would like to work on an issue, you are welcome to open a Merge Request with a fix.

#### Prerequisites

Before submitting any merge request, ensure your branch passes all tests:

```bash
npm run test
```

#### Commits

All commits must comply with the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

#### Branch

For contributions we are using [Gitflow as branching strategy](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow#:~:text=Gitflow%20is%20a%20legacy%20Git,software%20development%20and%20DevOps%20practices.).
