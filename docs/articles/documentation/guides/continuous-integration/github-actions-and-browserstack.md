---
layout: docs
title: Run Tests on BrowserStack with GitHub Actions
permalink: /documentation/guides/continuous-integration/github-actions-and-browserstack.html
redirect_from:
  - /documentation/recipes/integrating-testcafe-with-ci-systems/github-actions-and-browserstack.html
  - /documentation/continuous-integration/github-actions-and-browserstack.html
---
# Run Tests on BrowserStack with GitHub Actions

This topic describes use of [Run TestCafe action](https://github.com/DevExpress/testcafe-action) to integrate TestCafe into the [GitHub Actions](https://docs.github.com/en/actions/automating-your-workflow-with-github-actions) build process. Tests are performed in [BrowserStack](https://automate.browserstack.com/) cloud testing service.

* [Step 1 - Create a Workflow](#step-1---create-a-workflow)
* [Step 2 - Create a Job](#step-2---create-a-job)
* [Step 3 - Provide your BrowserStack credentials](#step-3---provide-browserstack-credentials)
* [Step 4 - Add a Step That Fetches The Repository](#step-4---add-a-step-that-fetches-the-repository)
* [Step 5 - Add a Step To Install TestCafe BrowserStack plugin](#step-5---add-a-step-to-install-testcafe-browserstack-plugin)
* [Step 6 - Add a Step That Runs TestCafe](#step-6---add-a-step-that-runs-testcafe)
* [Action Options](#action-options)
  * [args](#args)
  * [version](#version)
* [Example](#example)

## Step 1 - Create a Workflow

Create a YAML file (for instance, `testcafe-workflow.yml`) in the `.github/workflows` directory in your repository.

Specify the [workflow name](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#name) and the [event](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#on) that triggers this workflow.

```yml
name: End-to-End Tests
on: [push]
```

In this example, the workflow runs when you push changes to the repository.

## Step 2 - Create a Job

Create a job that runs the TestCafe tests.

Provide the [job name](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idname) and specify the [type of machine](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on) that should run the job.

```yml
name: End-to-End Tests
on: [push]

jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
```

This job runs on a GitHub-hosted virtual machine with the latest Windows version. `test` is the [job ID](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_id) that must be unique to the `jobs` object.

## Step 3 - Provide BrowserStack Credentials

In order for TestCafe to be able to use browsers, provided by BrowserStack, valid Username and Access Key are necessary. Values are unique to your BrowserStack account and can be obtained from your [account settings](https://www.browserstack.com/accounts/settings).

Values should be set to `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` environment variables respectively. However, for security purposes, it is reccomended that you provide them as [secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) in your repository.

After adding the secrets, add the following content to the [env](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#env) in your workflow YAML file:

{% raw %}

```yml
name: End-to-End Tests
on: [push]
env:
        BROWSERSTACK_ACCESS_KEY: "${{ secrets.BROWSERSTACK_ACCESS_KEY }}"
        BROWSERSTACK_USERNAME: "${{ secrets.BROWSERSTACK_USERNAME }}"
jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
      - name: Run tests
        uses: DevExpress/testcafe-action@latest
        with:
            args: "'browserstack:chrome@84.0:Windows 10' tests"
```

{% endraw %}

## Step 4 - Add a Step That Fetches The Repository

Add a [step](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idsteps) that uses the [checkout](https://github.com/actions/checkout) action to fetch your repository content.

{% raw %}

```yml
name: End-to-End Tests
on: [push]
env:
        BROWSERSTACK_ACCESS_KEY: "${{ secrets.BROWSERSTACK_ACCESS_KEY }}"
        BROWSERSTACK_USERNAME: "${{ secrets.BROWSERSTACK_USERNAME }}"
jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
```

{% endraw %}

## Step 5 - Add a Step To Install TestCafe BrowserStack plugin

In order to enable TestCafe to run in the BrowserStack environment, install our [browserstack plugin](https://github.com/DevExpress/testcafe-browser-provider-browserstack).

{% raw %}

```yml
name: End-to-End Tests
on: [push]
env:
        BROWSERSTACK_ACCESS_KEY: "${{ secrets.BROWSERSTACK_ACCESS_KEY }}"
        BROWSERSTACK_USERNAME: "${{ secrets.BROWSERSTACK_USERNAME }}"
jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
      - name: Install TestCafe BrowserStack plugin
        run: npm install testcafe-browser-provider-browserstack
```

{% endraw %}

## Step 6 - Add a Step That Runs TestCafe

Add the [Run TestCafe](https://github.com/DevExpress/testcafe-action) action. Use the [args](#args) parameter to provide TestCafe [command line arguments](../../reference/command-line-interface.md), including the BrowserStack configuration:

{% raw %}

```yml
name: End-to-End Tests
on: [push]
env:
        BROWSERSTACK_ACCESS_KEY: "${{ secrets.BROWSERSTACK_ACCESS_KEY }}"
        BROWSERSTACK_USERNAME: "${{ secrets.BROWSERSTACK_USERNAME }}"
jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
      - name: Run tests
        uses: DevExpress/testcafe-action@latest
        with:
            args: "'browserstack:chrome@84.0:Windows 10' tests"
```

{% endraw %}

> Note the additional pair of single quotes- BrowserStack configuration string includes a space, which can be interpreted as a separator by the command line.

**Note**: Full list of available BrowserStack configurations can be obtained through console.
First, you have to provide your credentials by exporting them:

**bash**

```sh
export BROWSERSTACK_USERNAME="<your_browserstack_username>"
export BROWSERSTACK_ACCESS_KEY="<your_browserstack_acess_key>"
```

**PowerShell**

```sh
Set-Variable -Name "BROWSERSTACK_USERNAME" -Value "<your_browserstack_username>"
Set-Variable -Name "BROWSERSTACK_ACCESS_KEY" -Value "<your_browserstack_acess_key>"
```

Afterwards, run in console:

```sh
testcafe -b browserstack
```

## Action Options

### args

TestCafe [command line arguments](../../reference/command-line-interface.md).

```yml
- uses: DevExpress/testcafe-action@latest
  with:
    args: "'browserstack:chrome@84.0:Windows 10' fixture.js -s takeOnFails=true -q -c 3"
```

### version

*Optional*

The TestCafe version to install.

```yml
- uses: DevExpress/testcafe-action@latest
  with:
    version: "1.6.0"
    args: "'browserstack:chrome@84.0:Windows 10' tests"
```

Commence the build by commiting changes and pushing to your repository. You can see the results on `Actions` page in your repository.

## Example

The following sample demonstrates how to run TestCafe tests across different browser versions and operating systems provided by BrowserStack.

{% raw %}

```yml
name: End-to-End Tests
on: [push]
env:
      BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
      BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
jobs:  
  windows10_test:
    name: Run Windows 10 TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
      - name: Install TestCafe BrowserStack plugin
        run: npm install testcafe-browser-provider-browserstack
      - name: Run Windows 10 Chrome@84.0 test
        uses: DevExpress/testcafe-action@latest
        with:
            args: "'browserstack:chrome@84.0:Windows 10' tests"
  windows8-1_test:
    name: Run Windows 8.1 TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
      - name: Install TestCafe BrowserStack plugin
        run: npm install testcafe-browser-provider-browserstack
      - name: Run Windows 8.1 Firefox@78.0 test
        uses: DevExpress/testcafe-action@latest
        with:
            args: "'browserstack:firefox@78.0:Windows 8.1' tests"
```

{% endraw %}
