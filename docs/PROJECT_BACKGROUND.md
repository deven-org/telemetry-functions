# Project Background
## Content

- [Project Background](#project-background)
  - [Content](#content)
  - [Background](#background)
  - [Strategy](#strategy)
  - [Tech Changes](#tech-changes)

## Background

In order to meet the goals of DEVEN Telemetry, the project needed a way to accept data events in the form of webhooks from Github, classify the event type, extract the applicable metrics, and push the relevant data to a private repository. **Telemetry-functions** solves this problem and serves as the mid layer in the DEVEN Telemetry project, sitting between the Github OAuth App and the private data repository. 

DEVEN Telemetry will eventually provide services to projects utilizing on Github, Bitbucket, and Gitlab version control software. This repository is specifically focused on Github, as it is currently used by two client projects which will be early adopters of the DEVEN Telemetry service.

## Strategy

The project uses [AWS](https://aws.amazon.com/) as a provider of serverless functions. AWS hosts the telemetry-functions service and provides an endpoint to receive a POST request when certain events happen.

For local development we use a local [Netlify](https://www.netlify.com/) instance.

## Tech Changes

We moved from hosting our telemetry function on [Netlify](https://www.netlify.com/) to [AWS](https://aws.amazon.com/).
For Netlify we only had the free tier and that was not enough for the long term.