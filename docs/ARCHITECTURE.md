# Architecture

**telemetry-functions** is a serverless function written in TypeScript that can be accessed via HTTP endpoints. It is designed to collect telemetry data from various sources and store it in a centralized location for analysis and reporting. This documentation will provide an overview of the architecture of telemetry-functions and how it can be used.

## Content

- [Architecture](#architecture)
  - [Content](#content)
  - [Overall Structure](#overall-structure)
    - [Code base](#code-base)
    - [Documentation and testing](#documentation-and-testing)
    - [CI/CD](#cicd)
    - [Usage](#usage)
  - [Technical Decisions](#technical-decisions)
    - [Hybrid Paradigm](#hybrid-paradigm)
      - [Real-time event collection](#real-time-event-collection)
      - [Asynchronous collection](#asynchronous-collection)
    - [Conclusion](#conclusion)
  - [Data duplication](#data-duplication)
  - [Github Webhook Events \& Collected Metrics](#github-webhook-events--collected-metrics)
    - [Adding a Webhook to a Project](#adding-a-webhook-to-a-project)
  - [AWS Cloud Architecture](#aws-cloud-architecture)
    - [AWS Lambda](#aws-lambda)
    - [AWS Systems Manager](#aws-systems-manager)
    - [Amazon API Gateway](#amazon-api-gateway)
    - [Permissions](#permissions)
  - [Github Tokens](#github-tokens)
    - [GITHUB\_ACCESS\_TOKEN](#github_access_token)
      - [Fine-Grained Token](#fine-grained-token)
      - [Classic token](#classic-token)
    - [REPO\_WRITE\_ACCESS\_TOKEN](#repo_write_access_token)
      - [Fine-Grained Token](#fine-grained-token-1)
      - [Classic token](#classic-token-1)

## Overall Structure

telemetry-functions is a Node.js application that is designed to be **serverless**. It is written in TypeScript, which allows for type checking and other features that can help catch errors early in the development process. The function is accessed through HTTP endpoints, which are exposed to the internet through a hosting provider (currently Netlify).

The function itself consists of several modules that work together to collect metrics and store them in a database (currently Github has been used as DB).

The first module, "**handler**", is used as controller, to define and handle the whole process, included the error management and the logger.

The second module, "**addSignature**", is responsible for identifing the events (_TriggerEvent_) coming from various sources: GitHub events, custom cron-jobs, manual requests, and other systems.
This module is designed to be flexible and can be customized to identify a various type of events.

The "signed event" (_SignedTriggerEvent_) is then sent to the third module, the processing module, "**collectMetrics**", which is responsible for collecting the metrics, normalizing and transforming the data into a standardized format (_EnhancedTriggerEvent_).

Once the event has been processed (_EnhancedTriggerEvent_), the fourth module stores it in a database (currently pushes it to a GitHub repo as JSON file.). _telemetry-functions_ is hosted on Netlify, but this is a temporary solution. In the future, the function will be hosted on a more robust and scalable platform that can handle large amounts of data.

### Code base

The telemetry-functions code base is stored in GitHub and owned by the Deven team. The repository is private and can be accessed only by authorized users. This ensures that the code base is secure and only accessible to the team members who are involved in developing and maintaining the project.

### Documentation and testing

Additionally, the project follows best practices for documentation, testing, and deployment. The code is well-documented with comments and clear instructions on how to use and contribute to the project. The project also includes comprehensive unit tests to ensure that changes do not introduce regressions or errors.

### CI/CD

The deployment process for the project is automated and follows a continuous integration and delivery (CI/CD) pipeline. This ensures that changes are thoroughly tested and validated before being deployed to the production environment.

### Usage

To use telemetry-functions, simply send data to the HTTP endpoints exposed by the function. If the payload (passed as event body) matches one of the known types, it will be processed and stored in the repo automatically.
Event body and headers are used to identify the event.

## Technical Decisions

### Hybrid Paradigm

The hybrid paradigm used in telemetry-functions is based on the requirements of the project, which require collecting metrics from Github using both event-driven and procedural paradigms. Event-driven programming is used to capture real-time events sent by Github, while the procedural paradigm is used to collect metrics asynchronously using cron jobs.

#### Real-time event collection

To collect metrics in real-time, _telemetry-functions_ uses a Github OAuth app. The app must be installed on an organization, and the admin of the organization must add the _telemetry-functions_ endpoint as a webhook. This allows telemetry-functions to listen to all Github events, and process only the ones that match specific conditions built to identify known events. Unrecognized events are ignored.

#### Asynchronous collection

To collect metrics asynchronously, _telemetry-functions_ uses cron jobs. Cron jobs are scheduled tasks that run at specified times, allowing telemetry-functions to collect metrics in the background at scheduled intervals.

### Conclusion

The hybrid paradigm used in telemetry-functions enables the project to collect metrics from Github using both event-driven and procedural paradigms. Real-time events are collected using a Github OAuth app and webhook, while asynchronous metrics are collected using cron jobs. This approach allows telemetry-functions to capture a wide range of metrics, making it a powerful tool for monitoring and analyzing Github data.

## Data duplication

The hybrid approach and the multiple ways of triggering the metrics collection create the possibility of gathering the same information multiple times. While data duplication may occur in this part of the process, it is allowed because all the collected data is identified with unique IDs. The second part of the process, responsible for parsing and merging all the collected metrics into a more comprehensive database, prevents duplicated entries by using the unique IDs. This ensures that the final database contains only the necessary information without redundancy, making it easier to analyze and draw conclusions.

## Github Webhook Events & Collected Metrics

To collect the metrics the list of github webhook events subscribed with oauth app are

- check_suite
- deployment
- pull_request
- workflow_job

More details about when each webhook event occurs, together with a detailed list of all metrics they trigger, see [METRICS.md](./METRICS.md).

### Adding a Webhook to a Project

In order to add a webhook to collect data of a project a new webhook has to be created within the Github organization or within a specific Github repository.

The trigger events should be selected individually to avoid unnecessary traffic. The currently used events are named:

- Branch or tag creation
- Check suites
- Deployments
- Pull requests
- Workflow jobs

## AWS Cloud Architecture

The cloud architecture in AWS is kept minimal. This keeps both costs and complexity low. There is no VPC required as the code does not access AWS resources which are bound to a VPC.

### AWS Lambda

AWS Lambda is the runtime environment where the code is executed. The code is split into two parts:
1. `lambda/handler.ts` validates the request. This code is AWS specific as it accesses further AWS resources, e.g. the storage where secrets are stored. If the request is valid, it is forwarded to `src/handler.ts`.
2. `src/handler.ts` implements the business logic. This code is cloud agnostic.

### AWS Systems Manager

In this service the secrets are stored. All have prefix `/telemetry/`. Please check the [deployment section](./DEPLOYMENT.md#secrets) for a list of all secrets.

### Amazon API Gateway

This service accepts web requests, in this case the webhook requests of Github. It accepts POST requests to /telemetry only and forwards them to above Lambda function.

To allow API Gateway logging to CloudWatch, an API Gateway account is created with all required permissions.

### Permissions

Lambda function is configured to accepts calls from API Gateway and to access secrets in Systems Manager.

## Github Tokens

To use the telemetry project there are two GitHub access tokens that needs to be created and configured.
Both are configured in the environment file. How to create the environment file is covered in the [README.md setup section](../README.md#setup).

### GITHUB_ACCESS_TOKEN

First we cover the creation of the `GITHUB_ACCESS_TOKEN`.
This token is used to gather additional information about the repository.

To create a new token one needs to navigate to the user settings in Github and in there to the `Developer Settings`, here a [deep link](https://github.com/settings/apps)

Under `Personal access tokens` one can create two different kind of tokens, the classic and the fine-grained token.

We recommend to create a fine-grained token.

#### Fine-Grained Token

In the `Personal access token` menu click on `Fine-grained tokens` and then click on the button `Generate new token`.

Now fill out the form, below is a description of each field and the values/settings we recommend or are needed for the telemetry project to be used.

**Token name**<br>
We recommend to use a name that includes the why and what of the token, e.g. `READ_ACCESS_FOR_TELEMETRY_PROJECT`.

**Expiration**<br>
Our recommendation is to select 90 days or more (over `Custom...` selection). The expiration date can not be updated later.
We also recommend that one creates a reminder for a few days before the token expires to coordinate the recreation of the token.

**Description**<br>
Here one can give more information about who created the token for what.

**Resource owner**<br>
If one is an administrator of a GitHub organization, this GitHub organization can be selected. If the telemetry project should be used for one specific organization we recommend to use the organization as resource owner.

**Repository access**<br>
Choose which repositories can be access with the new token.
Our recommendation is to select `Only selected repositories`, if not more then 50 repositories should be connected to the telemetry project.

If `Only selected repositories` was selected one needs to select all repositories in the dropdown (`Select repositories`) that appeared.

**Repository permissions**<br>
The following permissions need to be set to make sure the telemetry project can access all needed data.

- `Contents` needs to be set to `Read-only`
- `Deployments` needs to be set to `Read-only`
- `Pull requests` needs to be set to `Read-only`

**Account permissions**<br>
The telemetry project does not need any account permissions.

Now the new token can be created by clicking on the `Generate token` button.

On the next page the new token is shown. It is important to copy that token and store it somewhere safe. This is the only time where the token can be copied!

#### Classic token

In the `Personal access token` menu click on `Tokens (classic)` and then click on the button `Generate new token` and select `Generate new token (classic)`.

Now fill out the form, below is a description of each field and the values/settings we recommend or are needed for the telemetry project to be used.

**Note**<br>
We recommend to use a name that includes the why and what of the token, e.g. `READ_ACCESS_FOR_TELEMETRY_PROJECT`.

**Expiration**<br>
Our recommendation is to select 90 days or more (over `Custom...` selection). The expiration date can not be updated later.
We also recommend that one creates a reminder for a few days before the token expires to coordinate the recreation of the token.

**Select scopes**

Select the checkbox next to the `repo` text. With the classic token creation we can't use a more fine grained option.

Now the new token can be created by clicking on the `Generate token` button.

On the next page the new token is shown. It is important to copy that token and store it somewhere safe. This is the only time where the token can be copied!

### REPO_WRITE_ACCESS_TOKEN

Here we cover the creation of the `REPO_WRITE_ACCESS_TOKEN`.
This token is used to store the gather data in a private repository.

**IMPORTANT**: a freshly created repository will not work. The data repository needs to have at least a `main` branch. We recommend to create an initial commit where a README.md is included that describes the content of the data repository.

To create a new token one needs to navigate to the user settings in Github and in there to the `Developer Settings`, here a [deep link](https://github.com/settings/apps)

Under `Personal access tokens` one can create two different kind of tokens, the classic and the fine-grained token.

We recommend to create a fine-grained token.

#### Fine-Grained Token

In the `Personal access token` menu click on `Fine-grained tokens` and then click on the button `Generate new token`.

Now fill out the form, below is a description of each field and the values/settings we recommend or are needed for the telemetry project to be used.

**Token name**<br>
We recommend to use a name that includes the why and what of the token, e.g. `WRITE_ACCESS_TO_TELEMETRY_DATA_REPOSITORY`.

**Expiration**<br>
Our recommendation is to select 90 days or more (over `Custom...` selection). The expiration date can not be updated later.
We also recommend that one creates a reminder for a few days before the token expires to coordinate the recreation of the token.

**Description**<br>
Here one can give more information about who created the token for what.

**Resource owner**<br>
If one is an administrator of a GitHub organization, this GitHub organization can be selected. If the telemetry project should be used for one specific organization we recommend to use the organization as resource owner.

**Repository access**<br>
Choose which repositories can be access with the new token.
Our recommendation is to choose `Only selected repositories`.

After `Only selected repositories` was selected one needs to select the data repository in the dropdown (`Select repositories`) that appeared.

**Repository permissions**<br>
The following permission needs to be set to make sure the telemetry project can write the data into the repository.

- `Contents` needs to be set to `Read and write`

**Account permissions**<br>
The telemetry project does not need any account permissions.

Now the new token can be created by clicking on the `Generate token` button.

On the next page the new token is shown. It is important to copy that token and store it somewhere safe. This is the only time where the token can be copied!

#### Classic token

In the `Personal access token` menu click on `Tokens (classic)` and then click on the button `Generate new token` and select `Generate new token (classic)`.

Now fill out the form, below is a description of each field and the values/settings we recommend or are needed for the telemetry project to be used.

**Note**<br>
We recommend to use a name that includes the why and what of the token, e.g. `WRITE_ACCESS_TO_TELEMETRY_DATA_REPOSITORY`.

**Expiration**<br>
Our recommendation is to select 90 days or more (over `Custom...` selection). The expiration date can not be updated later.
We also recommend that one creates a reminder for a few days before the token expires to coordinate the recreation of the token.

**Select scopes**

Select the checkbox next to the `repo` text. With the classic token creation we can't use a more fine grained option.

Now the new token can be created by clicking on the `Generate token` button.

On the next page the new token is shown. It is important to copy that token and store it somewhere safe. This is the only time where the token can be copied!