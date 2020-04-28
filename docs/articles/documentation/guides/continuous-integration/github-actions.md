---
layout: docs
title: Integrate TestCafe with GitHub Actions
permalink: /documentation/guides/continuous-integration/github-actions.html
redirect_from:
  - /documentation/continuous-integration/github-actions.html
---
# Integrate TestCafe with GitHub Actions

This topic describes how to use the [Run TestCafe action](https://github.com/DevExpress/testcafe-action) to integrate TestCafe tests into the [GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions) build process.

* [Step 1 - Create a Workflow](#step-1---create-a-workflow)
* [Step 2 - Create a Job](#step-2---create-a-job)
* [Step 3 - Add a Step That Fetches The Repository](#step-3---add-a-step-that-fetches-the-repository)
* [Step 4 - Add a Step That Runs TestCafe](#step-4---add-a-step-that-runs-testcafe)
* [Action Options](#action-options)
  * [args](#args)
  * [version](#version)
* [Example](#example)

## Step 1 - Create a Workflow

Create a YAML file (for instance, `testcafe-workflow.yml`) in the `.github/workflows` directory in your repository.

Specify the [workflow name](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#name) and the [event](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#on) that triggers this workflow.

```yml
name: End-to-End Tests
on: [push]
```

In this example, the workflow runs when you push changes to the repository.

## Step 2 - Create a Job

Create a job that runs the TestCafe tests.

Provide the [job name](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idname) and specify the [type of machine](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on) that should run the job.

```yml
name: End-to-End Tests
on: [push]

jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
```

This job runs on a GitHub-hosted virtual machine with the latest Windows version. `test` is the [job ID](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_id) that must be unique to the `jobs` object.

## Step 3 - Add a Step That Fetches The Repository

Add a [step](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idsteps) that uses the [checkout](https://github.com/actions/checkout) action to fetch your repository content.

```yml
name: End-to-End Tests
on: [push]

jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v1
```

## Step 4 - Add a Step That Runs TestCafe

Add the [Run TestCafe](https://github.com/DevExpress/testcafe-action) action. Use the [args](#args) parameter to provide TestCafe [command line arguments](../../reference/command-line-interface.md).

```yml
name: End-to-End Tests
on: [push]

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
            args: "chrome tests"
```

## Action Options

### args

TestCafe [command line arguments](../../reference/command-line-interface.md).

```yml
- uses: DevExpress/testcafe-action@latest
  with:
    args: "chrome fixture.js -s takeOnFails=true -q -c 3"
```

### version

*Optional*

The TestCafe version to install.

```yml
- uses: DevExpress/testcafe-action@latest
  with:
    version: "1.6.0"
    args: "chrome tests"
```

**Default value**: `latest`

## Example

The following workflow demonstrates how to run TestCafe tests across Node.js versions and operating systems.

```yml
name: Target Multiple Node.js Versions and Operating Systems
on: [push]

jobs:
  build:
    name: Run Tests Across Node.js Versions and Operating Systems
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [8, 10, 12]
    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}
      - uses: actions/checkout@v1
      - name: Run TestCafe Tests
        uses: DevExpress/testcafe-action@latest
        with:
          args: "chrome tests"
```

This job contains a matrix strategy that duplicates it to run on Windows and Ubuntu virtual machines in three Node.js versions (`8`, `10`, and `12`).

The [setup-node](https://github.com/actions/setup-node) action installs the Node.js version defined in the matrix. Then [checkout](https://github.com/actions/checkout) fetches the code and `testcafe-action` runs tests.
