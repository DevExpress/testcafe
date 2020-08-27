---
layout: docs
title: Integrate TestCafe with GitHub Actions
permalink: /documentation/guides/continuous-integration/github-actions.html
redirect_from:
  - /documentation/continuous-integration/github-actions.html
---
# Integrate TestCafe with GitHub Actions

This topic describes how to use the [Run TestCafe action](https://github.com/DevExpress/testcafe-action) to integrate TestCafe tests into the [GitHub Actions](https://docs.github.com/en/actions/automating-your-workflow-with-github-actions) build process.

* [Step 1 - Create a Workflow](#step-1---create-a-workflow)
* [Step 2 - Create a Job](#step-2---create-a-job)
* [Step 3 - Add a Step that Fetches the Repository](#step-3---add-a-step-that-fetches-the-repository)
* [Step 4 - Add a Step that Runs TestCafe](#step-4---add-a-step-that-runs-testcafe)
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

You can [**use a GitHub-hosted machine**](https://docs.github.com/en/actions/reference/virtual-environments-for-github-hosted-runners):

```yml
name: End-to-End Tests
on: [push]

jobs:
  test:
    name: Run TestCafe Tests
    runs-on: windows-latest
```

This job runs on a GitHub-hosted virtual machine with the latest Windows version. `test` is the [job ID](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_id) that must be unique to the `jobs` object.

> You can use a GitHub-hosted virtual machine with a variety of operating systems to run tests, as listed on the following page: [GitHub Docs](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on). For simplicity, all examples in this article run on `windows-latest`.

Github Actions use the `macOS Catalina 10.15` virtual environment with *"System Integrity Protection"* enabled as `macos-latest`. With this setting enabled, TestCafe requires screen recording permission, which cannot be obtained programmatically. For this reason, TestCafe is unable to run tests with GitHub Actions locally on `macos-latest`.

However, tests can run on macOS virtual machines if you connect the browser as remote.

**Example**

```sh
export HOSTNAME=localhost
export PORT1=1337
export PORT2=1338
testcafe remote test.js --hostname ${HOSTNAME} --ports ${PORT1},${PORT2} &
pid=$!
open -a Safari http://${HOSTNAME}:${PORT1}/browser/connect
wait $pid
```

Alternatively, you can [**host your own runners**](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners) for the job. This gives you more precise control over the environment.

To set up the self-hosted runners, [add them to your repository](https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners#adding-a-self-hosted-runner-to-a-repository).

After that, configure `runs-on` in your workflow `.yml` file:

```yml
name: End-to-End Tests
on: [push]

jobs:
  test:
    name: Run TestCafe Tests
    runs-on: [self-hosted, linux]
```

> Make sure that the intended machine meets the [requirements for self-hosted runner machines](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners#requirements-for-self-hosted-runner-machines).
>
>For more information about self-hosted runners in the GitHub Actions workflow, refer to the following topic: [Using self-hosted runners in a workflow](https://docs.github.com/en/actions/hosting-your-own-runners/using-self-hosted-runners-in-a-workflow).

## Step 3 - Add a Step that Fetches the Repository

Add a [step](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idsteps) that uses the [checkout](https://github.com/actions/checkout) action to fetch your repository content.

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

## Step 4 - Add a Step that Runs TestCafe

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

{% raw %}

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

{% endraw %}

This job contains a matrix strategy that duplicates it to run on Windows and Ubuntu virtual machines in three Node.js versions (`8`, `10`, and `12`).

The [setup-node](https://github.com/actions/setup-node) action installs the Node.js version defined in the matrix. Then, [checkout](https://github.com/actions/checkout) fetches the code and `testcafe-action` runs tests.
