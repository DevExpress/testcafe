---
layout: docs
title: Run Tests in Bitbucket Pipelines
permalink: /documentation/continuous-integration/bitbucket-pipelines.html
redirect_from:
  - /documentation/recipes/integrating-testcafe-with-ci-systems/bitbucket-pipelines.html
---
# Run Tests in Bitbucket Pipelines CI

You can automatically run tests as a part of your build process using TestCafe and [Bitbucket Pipelines CI](https://bitbucket.org/product/features/pipelines).
The Bitbucket Pipelines support Docker containers, and there are some available with both Chrome e Firefox browsers included (also in headless mode)

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
2. Configuring the right environment can be tedious but luckily Bitbucket Pipelines can use Docker containers, some already configured to work with Chrome and Firefox. The `zenika/alpine-chrome:with-node` image comes already configured and ready to use for Chrome headless or Puppeteer.
3. An example template can have the following content to run on Pull Requests:

    ```yaml
    image: zenika/alpine-chrome:with-node
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

For more templates or more information about the Pipelines see the [Atlassian Bitbucket Support page](https://confluence.atlassian.com/bitbucket/get-started-with-bitbucket-pipelines-792298921.html)

## Step 3 - Add the `test` script to package.json

To test a project, Bitbucket Pipelines runs test scripts. For Node.js projects, the default test script is `npm test`.
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
