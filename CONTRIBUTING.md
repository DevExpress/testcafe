# Contributing to TestCafe

TestCafe would not be possible without active support from the community. We appreciate and encourage your contributions.

TestCafe is proud to follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md), which is a set of standards we expect all contributors to follow. This helps to create an open and welcoming environment so that everyone can participate.

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

The TestCafe team maintains a [project roadmap](https://testcafe.io/402949/roadmap). This roadmap contains a list of capabilities that we want to implement in the near future. We update the roadmap as we receive user feedback.

GitHub activity helps the TestCafe team gauge what our users want the most. Submit a [GitHub issue](https://github.com/DevExpress/testcafe/issues) to share your ideas about the future of TestCafe. Add votes and comments to existing issues to help us prioritise our work.

## Build TestCafe from Source

#### Prerequisites

TestCafe is a [Node.js](https://nodejs.org/en/) application. It supports [all actively maintained](https://github.com/nodejs/Release#release-schedule) versions of the Node.js framework. The installation process requires the presence of the [node package manager](https://www.npmjs.com/) (npm) software utility.

Run the following shell command to check if your operating system contains `node` and `npm`:

```sh
node -v; npm -v
```

If your system does not contain Node.js, download and install it from the [Node.js website](https://nodejs.org/en/).

You also need [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your computer. Installation instructions differ depending on your operating system — consult the [Git website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

#### Build TestCafe

1. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the [TestCafe repository](https://github.com/DevExpress/testcafe).

2. [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the repository.

3. From the root directory of the TestCafe clone, run the following shell command to install dependencies:

    ```sh
    npm install
    ```

    <!-- > [!NOTE]
    > TestCafe comes with a TypeScript 3 compiler. If your development environment contains a TypeScript 4+ compiler, the two packages may come into conflict and prevent a successful installation of TestCafe. If you can't resolve this conflict by other means, use a TypeScript [version manager](https://github.com/watilde/tvm) to manually install a compatible TypeScript compiler and switch between the two. -->

4. Run the following shell command to build the project:
    ```sh
    npx gulp build
    ```

You can now choose one of two options to test the built project &mdash; `npm link`, or `npm install`.

-   `npm link` is useful during testing, as you can write code and test iteratively without having to continually rebuild. This creates a [symlink](https://en.wikipedia.org/wiki/Symbolic_link), and so any changes you make in the `testcafe` project will be reflected in your test files directory.

-   `npm install` will create a local copy (rather than a symlink) of the `testcafe` package. You can also install the built project globally using the `-g` flag.

##### npm link

1. From the root of the `testcafe` directory, run the following shell command:

    ```sh
    npm link
    ```

2. Navigate to the directory with your test files, and run the following shell command:

    ```sh
    npm link testcafe
    ```

##### npm install

1. From the root of the `testcafe` directory, run the following shell command to pack the TestCafe project as a `tgz` package:

    ```sh
    npm pack
    ```

2. Navigate to the directory with your test files. Run the following shell command to install the built TestCafe project, with the correct path of the `tgz` file, and where `x.y.z` is the version number:

    ```sh
    npm install testcafe-x.y.z.tgz
    ```

<!-- The `/lib` directory stores build artifacts. Build tasks remove this folder before they run. To remove this directory manually, run the following command:

```sh
gulp clean
``` -->

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

<!-- On your local machine, from the root directory of the project, run the following command to create a new branch. Replace `branch-name` with (what?)

```sh
git checkout -b branch-name
``` -->

TestCafe has certain standards that need to be met. Before submitting a pull request, ensure that you have completed the following steps:

-   Add regression tests to the appropriate sections if you are fixing a bug. To find these sections, search for `Regression` in the code. If you are adding new functionality, add unit / functional tests.
-   Use the following commands to fetch upstream changes and rebase your branch onto `master`:
    ```sh
    git checkout master
    git fetch upstream
    git merge upstream/master
    ```
-   Run the following shell commands to run tests to check that everything works:

    ```sh
    gulp test-server
    gulp test-functional-local
    gulp test-client-local
    ```

-   The pull request name should describe the changes you implemented.
-   If you are fixing a bug, the pull request description should contain the [closes](https://github.blog/2013-05-14-closing-issues-via-pull-requests/) directive with the appropriate issue number.
-   Code must be linted without errors.

Please keep in mind that the team may **suspend or reject** pull requests that fail to meet these requirements. We do not merge pull requests until the changes have been documented.
