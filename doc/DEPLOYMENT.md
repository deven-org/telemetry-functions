# Deployment
This chapter will explain everything to know about deployments for telemetry-functions.

## Content
- [Tooling](#tooling)
- [How to deploy](#how-to-deploy)
- [Versioning](#versioning)
- [Release Management](#release-management)
- [Deployment Schedule](#deployment-schedule)
- [Support](#support)

## Tooling
Telemetry-functions uses [Github Actions](https://github.com/features/actions) and [Release Please](https://github.com/googleapis/release-please) to automate the release process. The team chose these tools in order to eliminate as many human touch points as possible in the process. This is important because telemetry-functions will be worked on by many different people, so automating as much as possible will reduce complexity and help to eliminate errors.  

Telemetry-functions uses Netlify as part of its functional architecture. Whenever there is a push on the `develop` branch, Netlify is automatically updated with the latest code and the serverless function is  re-deployed.

## How to deploy
Telemetry-functions uses the [`Release & Publish`]('./../.github/workflows/release.yml) Github action to initiate the deployment process. `Release & Publish` can be triggered manually on Github, but it also runs automatically whenever there is a push to the `main` branch. 

The workflow includes the following steps: 

1. Latest code is checked out of repository
2. Node environment is set up using the current node version of the project
3. Dependencies are cached
4. Dependencies are installed
5. New release created with Release Please
6. NPM package with new release is published
7. Slack notification for new release is sent to `deven` channel

## Versioning
Telemetry-functions uses Release Please to automate CHANGELOG generation, the creation of releases, and version bumps. Release Please uses [Semantic Versioning](https://semver.org/) to update the version number of releases based on the commits included in the release (using [Conventional Commit messages](https://www.conventionalcommits.org/en/v1.0.0/)).

## Release Management
If you have a release management setup in place, please describe the process and who to contact if support is needed.

## Deployment Schedule
Telemetry-functions does not have a set deployment schedule, but rather uses CI/CD to deploy as needed.

## Support
For support, please reach out to any current DEVEN team member or Ola Gasidlo-Braendel at [ola.gasidlo-braendel@accenture.com](mailto:ola.gasidlo-braendel@accenture.com).