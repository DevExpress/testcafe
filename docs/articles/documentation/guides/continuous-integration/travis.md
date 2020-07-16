---
layout: docs
title: Run Tests in Travis CI
permalink: /documentation/guides/continuous-integration/travis.html
redirect_from:
  - /documentation/recipes/integrating-testcafe-with-ci-systems/travis.html
  - /documentation/continuous-integration/travis.html
---
# Run Tests in Travis CI

You can automatically run tests as a part of your build process using TestCafe and [Travis CI](https://travis-ci.org/).
There are Linux versions of Chrome and Firefox browsers available for Travis CI builds, so you can run your tests completely in the cloud.

Suppose you have a GitHub project for which you need to automatically run tests in the cloud when the project is modified. To do this, go through the following steps.

* [Step 1 - Install TestCafe and create tests](#step-1---install-testcafe-and-create-tests)
* [Step 2 - Enable Travis for your project](#step-2---enable-travis-for-your-project)
* [Step 3 - Add the `test` script to package.json](#step-4---add-the-test-script-to-packagejson)
* [Step 4 - Trigger a Travis CI build](#step-5---trigger-a-travis-ci-build)

> TestCafe provides an [example](https://github.com/DevExpress/testcafe/tree/master/examples/running-tests-in-firefox-and-chrome-using-travis-ci/) that can show you how to run tests in Chrome and Firefox with Travis CI.

## Step 1 - Install TestCafe and create tests

Install TestCafe [locally](../basic-guides/install-testcafe.md#local-installation) in your project and [create tests](../../getting-started/README.md#creating-a-test).

## Step 2 - Enable Travis for your project

1. [Sign in to Travis CI](https://travis-ci.org/signin) with your GitHub account. Travis CI will synchronize your repositories from GitHub. You can see them on your [profile page](https://travis-ci.org/profile).
2. Enable Travis CI for a repository you want to build by flicking the switch on.

     ![Enable Travis for a repository](../../../images/travis-step-2-2.png)

     By default, Travic CI runs builds on pushes and pull requests. You can manage this behavior in your repository's settings.

     ![Enable builds](../../../images/travis-step-2-4.png)

3. Add a `.travis.yml` configuration file to the root of your project. This file contains parameters and commands that instruct Travis CI how to execute your builds. For more information, see [Customizing the Build](https://docs.travis-ci.com/user/customizing-the-build).

     For Node.js projects that require Firefox and Chrome installed, the `.travis.yml` file can have the following content:

     ```yaml
     language: node_js
     node_js: "stable"
  
     dist: bionic

     before_install:
        - stty cols 80

     addons:
        firefox: latest
        chrome: stable
     ```

     Commit and push this file to your repository.

## Step 3 - Add the `test` script to package.json

To test a project, Travis runs test scripts. For Node.js projects, the default test script is `npm test`.
To tell npm how to run your tests, add the `test` script to the project's package.json file. Use `testcafe` command in the script to run tests in Chrome and Firefox.

> Important! Travis CI uses Ubuntu Server virtual machines that do not have regular graphical environment like Unity, GNOME or KDE installed. Modify the `testcafe` command to run browsers headlessly.

```text
"scripts": {
    "test":  "testcafe chrome:headless,firefox:headless tests/index-test.js"
}
```

For more information on how to configure a test run using a `testcafe` command, see [Command Line Interface](../../reference/command-line-interface.md).

**Note:** If your app requires starting a custom web server, use the `--app` TestCafe option to specify a command that starts your server.
This command will be automatically executed before running tests. After tests are finished, TestCafe will stop the app server.

```text
"scripts": {
  "test":  "testcafe chrome:headless,firefox:headless tests/index-test.js --app \"node server.js\""
}
```

## Step 4 - Trigger a Travis CI build

You can trigger a Travis CI build by pushing commits to your repository or creating a pull request.

To check if the build passed or failed, go to the [builds dashboard](https://travis-ci.org/dashboard/builds).
