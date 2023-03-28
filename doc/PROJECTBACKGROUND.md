# Project Background
## Content

- [Background](#background)
- [Strategy](#strategy)
- [Tech Changes](#tech-changes)

## Background

In order to meet the goals of DEVEN Telemetry, the project needed a way to accept data events in the form of webhooks from Github, classify the event type, extract the applicable metrics, and push the relevant data to a private repository. **Telemetry-functions** solves this problem and serves as the mid layer in the DEVEN Telemetry project, sitting between the Github OAuth App and the private data repository. 

DEVEN Telemetry will eventually provide services to projects utilizing on Github, Bitbucket, and Gitlab version control software. This repository is specifically focused on Github, as it is currently used by two client projects which will be early adopters of the DEVEN Telemetry service.

## Strategy

The project uses [Netlify](https://www.netlify.com/) as a provider of serverless functions. Netlify hosts the telemetry-functions service and provides an endpoint to receive a POST request when certain events happen. The free tier includes 125,000 requests per month and 100 hours of run time. 

## Tech Changes

Getting project- and repository-level data from Github is possible through two different types of integrations, [*Github Apps*](https://docs.github.com/en/apps/creating-github-apps/creating-github-apps/about-apps#about-github-apps) and [*Github OAuth Apps*](https://docs.github.com/en/apps/creating-github-apps/creating-github-apps/about-apps#about-oauth-apps) (hereinafter referred to as *OAuth Apps*). Github Apps act on their own behalf, while OAuth Apps act on behalf of a user. This means that Github Apps are *installed* on organizations and personal accounts, while OAuth Apps are *invited*. With project requirements stating that nothing should be installed in clients' organizations or repositories, the team chose to create an OAuth App to gather data. 
