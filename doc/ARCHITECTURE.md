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

## Overall Structure

telemetry-functions is a Node.js application that is designed to be **serverless**. It is written in TypeScript, which allows for type checking and other features that can help catch errors early in the development process. The function is accessed through HTTP endpoints, which are exposed to the internet through a hosting provider (currently Netlify).

The function itself consists of several modules that work together to collect metrics and store them in a database (currently Github has been used as DB).

The first module, "**handler**", is used as controller, to define and handle the whole process, included the error management and the logger.

The second module, "**addSignature**", is responsible for identifing the events (_DataEvent_) coming from various sources: GitHub events, custom cron-jobs, manual requests, and other systems.
This module is designed to be flexible and can be customized to identify a various type of events.

The "signed event" (_SignedDataEvent_) is then sent to the third module, the processing module, "**collectMetrics**", which is responsible for collecting the metrics, normalizing and transforming the data into a standardized format (_EnhancedDataEvent_).

Once the event has been processed (_EnhancedDataEvent_), the fourth module stores it in a database (currently pushes it to a GitHub repo as JSON file.). _telemetry-functions_ is hosted on Netlify, but this is a temporary solution. In the future, the function will be hosted on a more robust and scalable platform that can handle large amounts of data.

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

## Webhook Events

To collect the metrics the list of github webhook events subscribed with oauth app are

- check_suite
- pull_request
- workflow_job

More details about when each webhook event occurs and link to documentation are here

### check_suite

This event used to collect CheckSuite Metrics and occurs when there is activity relating to a check suite. More information about what the payload contains and the APIs to manage check suites are available in the following link
- Github doc [CheckSuite Webhook](https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#check_suite)

### pull_request

This event occurs when there is activity on a pull request. For more information, about  what the payload contains and the APIs to manage pull requests, check the following link
- Github doc [Pull Requests Webhook](https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request)

### workflow_job

This event occurs when there is activity relating to a job in a GitHub Actions workflow. For more information about  what the payload contains and  the API to manage workflow jobs, check the following link

- Github doc [Workflow Job Webhook](https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#workflow_job)


###  Metrics Collected
The following metrics are collected from the webhook events

- CheckSuite Metrics
  - Event used - check-suite
  
  
    ```
    //Output
    {
      pull_requests: PullRequest[];
      created_at: number;
      conclusion: string;
      is_app_owner: boolean;
      updated_at: number;
      duration: number;
    }
    ```
- Test Coverage Metrics
  - Event used - workflow-job

      ```
      //Output
      {
        id: number;
        status: string;
        conclusion: string;
        is_workflow_name_about_test: boolean;
        steps_about_test: object[];
        has_failed_steps: boolean;
        total_tests_duration: number;
      };
      ```

- Release Versions Metrics
  - Event used - pull-request

    ```
    //Output
    {
      pull_number: number;
      title: object;
    };
    ```

- Commits Per Pr Metrics
  - Event used - pull-request

    ```
    //Output
    {
      commits: number;
      additions: number;
      deletions: number;
      commit_timestamps: [];
      pull_number: number;
    }
    ```
- Tooling Usage Metrics
  - No event used, metrics collected from repo's package json

    ```
    //Output
      {
        hasDocumentationSkeleton: boolean;
        devDependencies: object;
        dependencies: object;
        repo: string;
        owner: string;
        hasValidPackageJson: boolean;
        hasDocChapters: boolean;
      }
    ```
