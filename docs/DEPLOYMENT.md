# Deployment
This chapter will explain everything to know about deployments for telemetry-functions.

## Content
- [Deployment](#deployment)
  - [Content](#content)
  - [Tooling](#tooling)
  - [How to deploy](#how-to-deploy)
  - [Versioning](#versioning)
  - [Release Management](#release-management)
  - [Deployment Schedule](#deployment-schedule)
  - [Support](#support)
  - [GitHub configuration](#github-configuration)
    - [Set Repository variables](#set-repository-variables)
  - [AWS Cloud Deployment](#aws-cloud-deployment)
    - [Synthesize](#synthesize)
    - [Deploy](#deploy)
    - [Uninstall](#uninstall)
    - [Secrets](#secrets)

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

## GitHub configuration

### Set Repository variables

Follow the [GitHub documentation](https://docs.github.com/en/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository) to create repository variables.

A list of variables that needs to be created can be found in the [README setup section](../README.md#setup). Please note that the tokens mentioned in the list should **not** be added as repository variables.

## AWS Cloud Deployment
For deployment to AWS cloud, [AWS Cloud Development Kit (AWS CDK)](https://docs.aws.amazon.com/cdk/v2/guide/home.html) is used. CDK is part of dev dependencies and will be installed with `npm install`. An already globally installed CDK does not harm.

If you are going to deploy Telemetry-functions to a new AWS account, run `npx aws-cdk bootstrap aws://123456789012/eu-central-1` once. Replace the number with the AWS account number. For details check the [documentation](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html).

Multiple instances of Telemetry-functions can be installed side-by-side. Set environment variable `ENVIRONMENT_ID` to `main` for main installation, or any other value (e.g. the branch name). Only small letters, digits and hyphens are allowed. This environment name will become part of the AWS resource names and allows a separation of multiple installations. When `ENVIRONMENT_ID` is not set, the current user name will be used.

Deployment via CDK requires two steps: Synthesizing and deployment.

### Synthesize
Run `npx aws-cdk synth` to synthesize a AWS CloudFormation template. This script uses the following environment variables, see [README](../README.md#setup) [Please note that the secrets are excluded and not stored as environment variables] for details:

Variable         | Required | Example
---------------- | -------- | ----------------------
REPO_NAME        | yes      | telemetry-data
REPO_OWNER       | yes      | deven-org
REPO_PATH        | yes      | raw-data
TARGET_BRANCH    | yes      | main
COMMITTER_NAME   | no       | John Doe
COMMITTER_EMAIL  | no       | john.doe@telemetry.xyz
AUTHOR_NAME      | no       | John Doe
AUTHOR_EMAIL     | no       | john.doe@telemetry.xyz
CONFLICT_RETRIES | no       | 2

### Deploy
Run `npx aws-cdk deploy --all` to deploy the software to AWS cloud. Add parameter `--require-approval=never` to skip the approval confirmation.

After successful deployment, the webhook URL is printed on screen.
In addition, the names of some parameters are printed. Please create all parameters in AWS Console. For details, see [below](#secrets).

### Uninstall

Run `npx aws-cdk destroy --all` to remove the installation. Add parameter `--force` to skip the confirmation.

### Secrets
Some parameters are not stored in environment variables as they contain secrets. The following values must be stored as secret string in parameter store of AWS Systems Managers. They are not created automatically, they have to be created by hand. Please follow exactly the names of the deployment script (see above) as they depend on the current environment. In main environment, the names are as below, in all other environments the names have a suffix, e.g. `/telemetry/parameter-branch`.

- /telemetry/github-access-token/data
  - Description: Github access token of repository where the data is stored
  - Type: SecureString
  - Value: *a personal GitHub access token, eligible to write to repository*
- /telemetry/github-access-token/source
  - Description: Github access token of repository where to get telemetry data from
  - Type: SecureString
  - Value: *a personal GitHub access token, eligible to read repository*
- /telemetry/github-webhook-secret-token
  - Description: secret token for GitHub web hook, [see Details](https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks)
  - Type: SecureString
  - Value: *secret token*

To set the secrets find the AWS Systems Manager, then under `Application Management` select `Parameter Store`.
Click on the `Create parameter` button. Fill out the form with the values provided in the list above.