# Contributing to TestCafe

TestCafe would not be possible without active support from the community. We appreciate and encourage your contributions &mdash; thank you.

TestCafe abides by the [Contributor Code of Conduct](CODE_OF_CONDUCT.md).

### Table of Contents

-   [The TestCafe Project](#the-testcafe-project)
-   [Build TestCafe from Source](#build-testcafe-from-source)
    -   [Prerequisites](#prerequisites)
    -   [Build TestCafe](#build-testcafe)
-   [Test New Versions of TestCafe](#test-new-versions-of-testcafe)
    -   [Report Bugs and Issues](#report-bugs-and-issues)
        -   [Create a Minimal Working Example](#create-a-minimal-working-example)
    -   [Ask for Community Support](#ask-for-community-support)
-   [Contribute Code](#contribute-code)

## The TestCafe Project

Our [roadmap](https://testcafe.io/402949/roadmap) outlines capabilities that the TestCafe team wants to implement in the near future. This is not a definitive list: we update it as we receive your feedback.

We invite you to share your ideas about the future of TestCafe by submitting an issue on [GitHub](https://github.com/DevExpress/testcafe/issues). Issue activity helps us gauge what our users want the most &mdash; vote on capabilities you want us to implement first to help us prioritize our work.

## Build TestCafe from Source

#### Prerequisites

TestCafe requires [Node.js](https://nodejs.org/en/) version X or newer, and [npm](https://www.npmjs.com/) version X or newer. From your command shell, run the following command to check if you already have compatible versions:

```sh
node -v; npm -v
```

If you need to update or install [Node.js](https://nodejs.org/en/) or [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), first download and install Node.js from the [Node.js website](https://nodejs.org/en/), and then run the following command to install npm:

```sh
npm install -g npm
```

You will also need [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your computer. Installation instructions differ depending on your operating system &mdash; consult the [Git website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

#### Build TestCafe

Firstly, navigate to the [TestCafe repository](https://github.com/DevExpress/testcafe) and fork the project by clicking the 'Fork' button in the top-right corner of the page.

Next, use the following command to clone the forked repository to your local machine (replace `username` with your GitHub username):

```sh
git clone git@github.com:username/testcafe
```

On your local machine, from the root directory of the project, run the following command to create a new branch. Replace `branch-name` with (what?)

```sh
git checkout -b branch-name
```

Next, install dependencies:

```sh
npm install
```

> [!NOTE]
> You may encounter dependency issues if you only have TypeScript version 4 or later. In this case, use a TypeScript [version manager](https://github.com/watilde/tvm) and install an older version, such as [v3.9.7](https://www.npmjs.com/package/typescript).

Use the following command to lint the code using `eslint`, and build the project:

```sh
npx gulp build
```

You can now choose one of two options to test the built project &mdash; `npm link`, or `npm install`.

#### npm link

With `npm link`, you can write code and test iteratively without having to continually rebuild. This creates a symlink, and so any changes you make in the `testcafe` project will be reflected in your test folder.

From the root of the `testcafe` directory, run the following command:

```sh
npm link
```

Next, navigate to the directory in which you will place test files, and run:

```sh
npm link testcafe
```

#### npm install

Use the following command to pack the TestCafe project as a `tgz` package in the current directory:

```sh
npm pack
```

From the directory in which you will place test files, you can now install the built TestCafe project with the following command, where `x.y.z` is the version number:

```sh
npm install testcafe-x.y.z.tgz
```

The `/lib` directory stores build artifacts. Build tasks remove this folder before they run. To remove this directory manually, run the following command:

```sh
gulp clean
```

## Test New Versions of Testcafe

### Report Bugs and Issues

If you encounter a bug with TestCafe, check if it has already been reported in the [GitHub repository](https://github.com/DevExpress/testcafe/issues). If it hasn't, please file a new issue.

When you create a new issue, a template is provided. Complete all sections of the template to help us understand the problem you are describing. Missing information could delay processing time.

> [!NOTE]
> You are also welcome to [submit issues](https://github.com/DevExpress/testcafe/issues) relating to our [documentation](https://testcafe.io/documentation/402635/getting-started).

#### Create a Minimal Working Example

It is important to include a [Minimal Working Example](https://testcafe.io/402636/faq#how-to-create-a-minimal-working-example-when-you-submit-an-issue) (MWE) with your bug report. A good MWE ensures the issue is easy to reproduce and troubleshoot, while being as small and as simple as possible.

A Minimal Working Example should:

-   Be simple and easy to follow. Convoluted scenarios are hard to reproduce.
-   Not contain code that does not help reproduce the issue. Remove actions that do not affect the outcome.
-   Include a complete set of relevant data: the URL of the test page, the list of launch options, and the steps you follow to launch the tests.

### Ask for Community Support

If you need help with using TestCafe, or want to help other users, join the TestCafe community on Stack Overflow. Ask and answer [questions with the TestCafe tag](https://stackoverflow.com/questions/tagged/testcafe).

## Contribute Code

TestCafe has certain standards that need to be met. Before submitting a pull request, ensure that you have completed the following steps:

-   Add regression tests to the appropriate sections if you are fixing a bug. To find these sections, search for `Regression` in the code. If you are adding new functionality, add unit / functional tests.
-   Use the following commands to fetch upstream changes and rebase your branch onto `master`:
    ```sh
    git checkout master
    git fetch upstream
    git merge upstream/master
    ```
-   Use the following commands to run tests to check that everything works:

    ```sh
    gulp test-server
    gulp test-functional-local
    gulp test-client-local
    ```

-   The pull request name should describe the changes you implemented.
-   If you are fixing a bug, the pull request description should contain the [closes](https://github.blog/2013-05-14-closing-issues-via-pull-requests/) directive with the appropriate issue number.
-   Code must be linted without errors (see [Build TestCafe](#build-testcafe)).

Please keep in mind that the team may **suspend or reject** pull requests that fail to meet these requirements. We do not merge pull requests until the changes have been documented.
