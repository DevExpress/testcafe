---
layout: docs
title: Run Tests in Bitbucket Pipelines
permalink: /documentation/continuous-integration/bitbucket-pipelines.html
redirect_from:
  - /documentation/recipes/integrating-testcafe-with-ci-systems/bitbucket-pipelines.html
---
# Run Tests in Bitbucket Pipelines CI

You can automatically run tests as a part of your build process using TestCafe and [Bitbucket Pipelines CI](https://bitbucket.org/product/features/pipelines).
The Bitbucket Pipelines support Docker containers, and there are some available with both Chrome e Firefox browsers included (also in headless mode).

Suppose you have a Bitbucket project for which you need to automatically run tests in the cloud when the project is modified. To do this, go through the following steps.

* [Step 1 - Install TestCafe and create tests](#step-1---install-testcafe-and-create-tests)
* [Step 2 - Configure Bitbucket Pipelines to run for your project](#step-2---enable-bitbucket-pipelines-for-your-project)
* [Step 3 - Add the `test` script to package.json](#step-3---add-the-test-script-to-packagejson)
* [Step 4 - Trigger a Bitbucket Pipelines build](#step-4---trigger-a-bitbucket-pipelines-ci-build)

> TestCafe provides an [example](https://github.com/DevExpress/testcafe/tree/master/examples/running-tests-in-chrome-using-bitbucket-pipelines-ci/) that can show you how to run tests in Chrome with Bitbucket Pipelines CI.

## Step 1 - Install TestCafe and create tests

Install TestCafe [locally](../using-testcafe/installing-testcafe.md#locally) in your project and [create tests](../getting-started/README.md#creating-a-test).

## Step 2 - Enable Bitbucket Pipelines for your project

1. To enable the Bitbucket Pipelines for your project you need to create a `bitbucket-pipelines.yml` file in your project root folder.
2. Configuring the right environment can be tedious but luckily Bitbucket Pipelines can use Docker containers, some already configured to work with Chrome and Firefox. You can [use a TestCafe Docker image](#option-1---use-testcafe-docker-image) with pre-installed software.
However, if you already have a Docker image prepared to deploy your web application and run tests, you can [install TestCafe on this image before testing](#option-2---install-testcafe-on-a-docker-image).
3. Configure the template to execute on Pull Request update


For more templates or more information about the Pipelines see the [Atlassian Bitbucket Support page](https://confluence.atlassian.com/bitbucket/get-started-with-bitbucket-pipelines-792298921.html)

### Option 1 - Use TestCafe Docker Image

In the `image` field of the `bitbucket-pipelines.yml` file you can set the `testcafe/testcafe` image and then use the custom launcher when the PR is updated:

    ```yaml
    image: testcafe/testcafe
    pipelines:
      pull-requests:
        '**':
          - step:
              script:
                - npm ci
                - /opt/testcafe/docker/testcafe-docker.sh firefox:headless,chromium tests/**/*

      branches:
        master:
          - step:
              script:
                - npm ci
                - /opt/testcafe/docker/testcafe-docker.sh firefox:headless,chromium tests/**/*
    ```

The custom launcher script `/opt/testcafe/docker/testcafe-docker.sh` points to a script that prepares the environment to run a browser and starts TestCafe. Its arguments are standard TestCafe [command line parameters](../using-testcafe/command-line-interface.md).

Commit and push this file to your repository.

### Option 2 - Install TestCafe on a Docker Image

Open the `bitbucket-pipelines.yml` file and use an image with Node.js with browsers already installed in it:

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

    Commit and push this file to your repository.

## Step 3 - Add the `test` script to package.json

To test a project, Bitbucket Pipelines runs test scripts. For Node.js projects, the default test script is `npm test`.

**Note**: if you used [Option #1](#option-1---use-testcafe-docker-image) you can skip this step already and go to [Step 4](#step-4---trigger-a-bitbucket-pipelines-ci-build).

To tell npm how to run your tests, add the `test` script to the project's package.json file. Use `testcafe` command in the script to run tests in Chrome in Headless mode.

```text
"scripts": {
    "test":  "testcafe 'chromium:headless --no-sandbox --disable-setuid-sandbox --window-size=1920x1080' tests/index-test.js"
}
```

For more information on how to configure a test run using a `testcafe` command, see [Command Line Interface](../using-testcafe/command-line-interface.md).

**Note:** If your app requires starting a custom web server, use the `--app` TestCafe option to specify a command that starts your server.
This command will be automatically executed before running tests. After tests are finished, TestCafe will stop the app server.

```text
"scripts": {
  "test":  "testcafe 'chromium:headless --no-sandbox --disable-setuid-sandbox --window-size=1920x1080' tests/index-test.js --app \"node server.js\""
}
```

## Step 5 - Trigger a Bitbucket Pipeplines CI build

You can trigger a Bitbucket Pipeplines CI build by pushing commits to your repository or creating a pull request.

To check if the build passed or failed, go to the Pipelines status page in your project page.
