---
layout: docs
title: Run Tests in Bitbucket Pipelines
permalink: /documentation/guides/continuous-integration/bitbucket-pipelines.html
redirect_from:
  - /documentation/continuous-integration/bitbucket-pipelines.html
---
# Run Tests in Bitbucket Pipelines CI

You can run TestCafe tests as a part of your build process on [Bitbucket Pipelines CI](https://bitbucket.org/product/features/pipelines).

You can set up your Bitbucket project to automatically run tests in the cloud when the project is modified:

* [Step 1 - Install TestCafe and Create Tests](#step-1---install-testcafe-and-create-tests)
* [Step 2 - Enable Bitbucket Pipelines for Your Project](#step-2---enable-bitbucket-pipelines-for-your-project)
  * [Option 1 - Use TestCafe Docker Image](#option-1---use-testcafe-docker-image)
  * [Option 2 - Install TestCafe on a Docker Image](#option-2---install-testcafe-on-a-docker-image)
* [Step 3 - Trigger a Bitbucket Pipelines Build](#step-3---trigger-a-bitbucket-pipelines-ci-build)

> TestCafe provides an [example](https://github.com/DevExpress/testcafe/tree/master/examples/running-tests-in-chrome-using-bitbucket-pipelines-ci/) that shows how to run tests in Chrome with Bitbucket Pipelines CI.

## Step 1 - Install TestCafe and Create Tests

Install TestCafe [locally](../basic-guides/install-testcafe.md#local-installation) in your project and [create tests](../../getting-started/README.md#creating-a-test).

## Step 2 - Enable Bitbucket Pipelines for Your Project

To enable Bitbucket Pipelines for your project, create a `bitbucket-pipelines.yml` file in the project's root folder.

Bitbucket Pipelines CI allows you to use Docker containers with pre-configured testing environments, including Chrome and Firefox. TestCafe also [provides a Docker image](#option-1---use-testcafe-docker-image) you can use to run tests.
However, if you already have a Docker image prepared, you can [install TestCafe on this image before testing](#option-2---install-testcafe-on-a-docker-image).

For more information about how to get started with Pipelines, see the [Atlassian Bitbucket support page](https://confluence.atlassian.com/bitbucket/get-started-with-bitbucket-pipelines-792298921.html).

### Option 1 - Use TestCafe Docker Image

Specify the `testcafe/testcafe` image name in the [bitbucket-pipelines.yml file](https://confluence.atlassian.com/bitbucket/configure-bitbucket-pipelines-yml-792298910.html)'s `image` field. Then, configure a pipeline that installs the project's dependencies and triggers a custom TestCafe launcher when you push commits and create pull requests.

```yaml
image: testcafe/testcafe
pipelines:
  pull-requests:
    '**':
      - step:
          script:
            - npm ci
            - /opt/testcafe/docker/testcafe-docker.sh 'firefox:headless,chromium --no-sandbox --disable-dev-shm-usage' tests/**/*

  branches:
    master:
      - step:
          script:
            - npm ci
            - /opt/testcafe/docker/testcafe-docker.sh 'firefox:headless,chromium --no-sandbox --disable-dev-shm-usage' tests/**/*
```

The custom launcher script `/opt/testcafe/docker/testcafe-docker.sh` prepares the environment to run a browser and starts TestCafe. Its arguments are standard TestCafe [command line parameters](../../reference/command-line-interface.md).

> The `--no-sandbox` flag is required to run Chrome/Chromium in an unprivileged container. `--disable-dev-shm-usage` prevents the `/dev/shm` storage overflow.

Commit and push this file to your repository.

### Option 2 - Install TestCafe on a Docker Image

Use the `image` field in the [bitbucket-pipelines.yml file](https://confluence.atlassian.com/bitbucket/configure-bitbucket-pipelines-yml-792298910.html) to specify a Docker image with Node.js and browsers installed. Then, configure a pipeline that installs the project's dependencies and runs tests when you push commits and create pull requests.

```yaml
# Replace '10.14' with the latest Node.js LTS version
# available on Docker Hub
image: circleci/node:10.14-browsers
pipelines:
  pull-requests:
    '**':
      - step:
          script:
            - npm ci
            - npm test

  branches:
    master:
      - step:
          script:
            - npm ci
            - npm test
```

To specify how npm should run TestCafe, add the `test` script to the project's `package.json` file and execute the `testcafe` command in this script.

The following example shows a command that runs tests in Chromium in headless mode:

```json
"scripts": {
    "test":  "testcafe 'chromium:headless --no-sandbox --disable-dev-shm-usage --disable-setuid-sandbox' tests/index-test.js"
}
```

> The `--no-sandbox` flag is required to run Chrome/Chromium in an unprivileged container. `--disable-dev-shm-usage` prevents the `/dev/shm` storage overflow. `--disable-setuid-sandbox` allows Chromium to run from the root account. It is required for this CircleCI image because it runs all commands with root rights.

For more information on how to configure a test run with the `testcafe` command, see [Command Line Interface](../../reference/command-line-interface.md).

Commit the changes and push them to your repository.

### Tip: Start a Custom Web Server

If you need to start a custom Web server to host your application, use the [--app](../../reference/command-line-interface.md#-a-command---app-command) TestCafe option followed by a command that starts this server.
TestCafe executes this command before tests are launched. After tests finish, TestCafe stops the server.

```json
"scripts": {
  "test":  "testcafe firefox tests/index-test.js --app \"node server.js\""
}
```

## Step 3 - Trigger a Bitbucket Pipelines CI Build

Bitbucket Pipelines CI is now configured to trigger the build when you push commits to your repository or create a pull request.

To check if the build has passed or failed, open your project's page and go to the Pipelines status page.

> Important! If the build fails with the **Unable to establish one or more of the specified browser connections** error, refer to [this troubleshooting guide](../advanced-guides/use-testcafe-docker-image.md#troubleshooting).
