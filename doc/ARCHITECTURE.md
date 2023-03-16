# Architecture

**telemetry-function** is a serverless function written in TypeScript that can be accessed via HTTP endpoints. It is designed to collect telemetry data from various sources and store it in a centralized location for analysis and reporting. This documentation will provide an overview of the architecture of telemetry-function and how it can be used.

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

Telemetry-function is a Node.js application that is designed to be **serverless**. It is written in TypeScript, which allows for type checking and other features that can help catch errors early in the development process. The function is accessed through HTTP endpoints, which are exposed to the internet through a hosting provider (currently Netlify).

The function itself consists of several modules that work together to collect metrics and store them in a database (currently Github has been used as DB).

The first module, "**handler**", is used as controller, to define and handle the whole process, included the error management and the logger.

The second module, "**addSignature**", is responsible for identifing the events (_DataEvent_) coming from various sources: GitHub events, custom cron-jobs, manual requests, and other systems.
This module is designed to be flexible and can be customized to identify a various type of events.

The "signed event" (_SignedDataEvent_) is then sent to the third module, the processing module, "**collectMetrics**", which is responsible for collecting the metrics, normalizing and transforming the data into a standardized format (_EnhancedDataEvent_).

Once the event has been processed (_EnhancedDataEvent_), the fourth module stores it in a database (currently pushes it to a GitHub repo as JSON file.). _telemetry-function_ is hosted on Netlify, but this is a temporary solution. In the future, the function will be hosted on a more robust and scalable platform that can handle large amounts of data.

### Code base

The telemetry-function code base is stored in GitHub and owned by the Deven team. The repository is private and can be accessed only by authorized users. This ensures that the code base is secure and only accessible to the team members who are involved in developing and maintaining the project.

### Documentation and testing

Additionally, the project follows best practices for documentation, testing, and deployment. The code is well-documented with comments and clear instructions on how to use and contribute to the project. The project also includes comprehensive unit tests to ensure that changes do not introduce regressions or errors.

### CI/CD

The deployment process for the project is automated and follows a continuous integration and delivery (CI/CD) pipeline. This ensures that changes are thoroughly tested and validated before being deployed to the production environment.

### Usage

To use telemetry-function, simply send data to the HTTP endpoints exposed by the function. If the payload (passed as event body) matches one of the known types, it will be processed and stored in the repo automatically.
Event body and headers are used to identify the event.

## Technical Decisions

### Hybrid Paradigm

The hybrid paradigm used in telemetry-function is based on the requirements of the project, which require collecting metrics from Github using both event-driven and procedural paradigms. Event-driven programming is used to capture real-time events sent by Github, while the procedural paradigm is used to collect metrics asynchronously using cron jobs.

#### Real-time event collection

To collect metrics in real-time, _telemetry-function_ uses a Github OAuth app. The app must be installed on an organization, and the admin of the organization must add the _telemetry-function_ endpoint as a webhook. This allows telemetry-function to listen to all Github events, and process only the ones that match specific conditions built to identify known events. Unrecognized events are ignored.

#### Asynchronous collection

To collect metrics asynchronously, _telemetry-function_ uses cron jobs. Cron jobs are scheduled tasks that run at specified times, allowing telemetry-function to collect metrics in the background at scheduled intervals.

### Conclusion

The hybrid paradigm used in telemetry-function enables the project to collect metrics from Github using both event-driven and procedural paradigms. Real-time events are collected using a Github OAuth app and webhook, while asynchronous metrics are collected using cron jobs. This approach allows telemetry-function to capture a wide range of metrics, making it a powerful tool for monitoring and analyzing Github data.

## Data duplication

The hybrid approach and the multiple ways of triggering the metrics collection create the possibility of gathering the same information multiple times. While data duplication may occur in this part of the process, it is allowed because all the collected data is identified with unique IDs. The second part of the process, responsible for parsing and merging all the collected metrics into a more comprehensive database, prevents duplicated entries by using the unique IDs. This ensures that the final database contains only the necessary information without redundancy, making it easier to analyze and draw conclusions.
