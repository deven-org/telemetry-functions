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
  - [AWS Cloud Deployment](#aws-cloud-deployment)
    - [Synthesize](#synthesize)
    - [Deploy](#deploy)
    - [Uninstall](#uninstall)
    - [Secrets](#secrets)
  - [Add New AWS Instance](#add-new-aws-instance)
  - [Cleanup AWS Instance](#cleanup-aws-instance)

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

## AWS Cloud Deployment
For deployment to AWS cloud, [AWS Cloud Development Kit (AWS CDK)](https://docs.aws.amazon.com/cdk/v2/guide/home.html) is used. CDK is part of dev dependencies and will be installed with `npm install`. An already globally installed CDK does not harm.

If you are going to deploy Telemetry-functions to a new AWS account, run `npx aws-cdk bootstrap aws://123456789012/eu-central-1` once. Replace the number with the AWS account number. For details check the [documentation](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html).

Multiple instances of Telemetry-functions can be installed side-by-side. Set environment variable `ENVIRONMENT_ID` to `main` for main installation, or any other value (e.g. the branch name). Only small letters, digits and hyphens are allowed. This environment name will become part of the AWS resource names and allows a separation of multiple installations. When `ENVIRONMENT_ID` is not set, the current user name will be used.

Deployment via CDK requires two steps: Synthesizing and deployment.

### Synthesize
Run `npx aws-cdk synth` to synthesize a AWS CloudFormation template. This script uses the following environment variables, see [README](../README.md#setup) for details:

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

If one needs to create a secret for a AWS instance different then the default one a postfix needs to be used. The postfix needs to be the same as the value that was used when the new instance was created.

The schema for the secrets for such an instance is {SECRET_NAME}-{POSTFIX}, e.g. `/telemetry/github-access-token/data-postfixvalue`.

The name for the secret can also be found in the deployed AWS lambda instance under the 'Configuration' -> 'Environment variables'

## Add New AWS Instance

To add a new instance for a new project stack, e.g. a GitHub organization, these are the steps to be made, please follow them in the order they are written down.

> [!IMPORTANT]
> Right now it is not configurable where the data is stored.
> All data will be stored in the data repository of the DEVEN organization.

1. **Create a GitHub token**

    The telemetry stack needs to be able to access the code and workflows of the systems that should be observed.

    Please follow the instructions under [GitHub access token](./ARCHITECTURE.md#github_access_token) to create such a token.

2. **Configure secrets for new instance**

    A maintainer of the telemetry project with AWS access needs to configure the secrets for the new instance.
    This includes the created GitHub token from the step before.

    Which secrets need to be configured and where is documented in the [secrets](#secrets) section of this document.

    It is important to align here on the postfix that will be used for the new secrets and AWS instance. The recommendation is to use the name of the organization/project.

3. **Deploy new AWS instance**

    To deploy the new instance the [Project Deployment workflow](https://github.com/deven-org/telemetry-functions/actions/workflows/deployment-project.yml) needs to be used.

    In this workflow one needs to select the 'Run workflow' button and there under the 'Project Name' the same postfix that was used in the prior step needs to be used.

    If the values of the 'Project Name' and the postfix used in the last step are not the same, the telemetry instance will not work!

4. **Define webhook in Github**

    In this step the webhook will be setup for the organization/project.

    The URL for the webhook can be found in the output of the workflow of the previous step. To find the URL follow these steps:
    - open the 'Project Deployment' workflow that was started in the [actions tab](https://github.com/deven-org/telemetry-functions/actions/workflows/deployment-project.yml)
    - select the 'deploy' job
    - in that job open the 'Deploy' step and scroll of the bottom of it
    - here the value for `TelemetryFunctionsStack-[YOUR-POSTFIX].ApiUrl` is the URL of the AWS instance

    Once the URL of the AWS instance is copied go to the GitHub settings of the organization/project select there 'Webhooks' and click on the button 'Add Webhook'.

    In the form paste the URL of the AWS instance under 'Payload URL'.
    As 'Content Type' select 'application/json'.
    For 'Secret' use the secret provided by the person that created the secrets in the second step.
    And last for the question of which events should trigger the webhook select 'Let me select individual events' and follow the [adding a webhook documentation](./ARCHITECTURE.md#adding-a-webhook-to-a-project).

    Once the webhook is saved it should start to send events to the new AWS instance.

5. **Test the webhook**

    To test the webhook one can create a new PR in one of the now connected projects.

    Only the creation of a PR should already trigger events that are send to the new AWS instance. If the delivery of the events was successful can be seen in the created webhook in GitHub.

    If one selects the newly created webhook in GitHub and scrolls to the end there are all events listed that are send to the new AWS instance. In front of each event should be a green checkmark to symbolize that the delivery was successful. If that is not the case please get in touch with the maintainer that helped to setup the new instance to get support in finding and solving the issue.

## Cleanup AWS Instance

To cleanup and existing instance of a project stack, e.g. a GitHub organization, these are the steps to be made, please follow them in the order they are written down.

1. **Double check**

    Please double check that the AWS instance you want to delete should be deleted.

2. **Run workflow**

    We have a [cleanup project workflow](https://github.com/deven-org/telemetry-functions/actions/workflows/cleanup-project.yml) to delete an existing AWS stack.

    In this workflow one needs to select the 'Run workflow' button and there under the 'Project Name' the same postfix that was used to create the instance needs to be used.

    A maintainer of the telemetry project with AWS access can provide the postfix.

3. **Delete secrets**

    A maintainer of the telemetry project with AWS access needs to delete the secrets of the deleted instance.

    Please make sure that **only** the secrets of the deleted AWS instance are deleted. They can be identified by the postfix.

4. **Delete GitHub access token**

    The project/organization that used the deleted AWS instance needed to provide a GitHub access token which was used by the webhook. As this access token is not needed anymore it should be communicated to the maintainers of the project/organization that this access token should be deleted.