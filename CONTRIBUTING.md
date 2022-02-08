# Contributing to TestCafe

### Table of Contents

-   [The TestCafe Community](#the-testcafe-community)
-   [Build TestCafe from Source](#build-testcafe-from-source)
    -   [Prerequisites](#prerequisites)
    -   [Build TestCafe](#build-testcafe)
-   [Test New Versions of TestCafe](#test-new-versions-of-testcafe)
    -   [Report Bugs and Issues](#report-bugs-and-issues)
        -   [Create a Minimal Working Example](#create-a-minimal-working-example)
    -   [Ask for Community Support](#ask-for-community-support)
-   [Contribute Code](#contribute-code)
-   [Contribute to Documentation](#contribute-to-documentation)

## The TestCafe Community

TestCafe is maintained by a core team of developers at [Developer Express](https://devexpress.com). TestCafe is an [open-source](https://github.com/DevExpress/testcafe/blob/master/LICENSE) project, and would not be possible without active support from the community. We appreciate and encourage your contributions.

The TestCafe team maintains a [project roadmap](https://testcafe.io/402949/roadmap). This roadmap contains a list of capabilities that we want to implement in the near future. We update the roadmap as we receive user feedback.

GitHub activity helps the TestCafe team gauge what our users want the most. Submit a [GitHub issue](https://github.com/DevExpress/testcafe/issues) to share your ideas about the future of TestCafe. Add votes and comments to existing issues to help us prioritize our work.

TestCafe is proud to follow a set of ethical standards called the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). This code of conduct helps us create a more open and welcoming environment. The TestCafe team expects both project maintainers and project contributors to adhere to these rules.

## Build TestCafe from Source

If you want to test the development version of TestCafe, or contribute code to the project, you need to know how to build the framework from [source](https://github.com/DevExpress/testcafe).

#### Prerequisites

TestCafe is a [Node.js](https://nodejs.org/en/) application. It supports [all actively maintained](https://github.com/nodejs/Release#release-schedule) versions of the Node.js framework. The installation process requires the [node package manager](https://www.npmjs.com/) (npm) software utility.

Run the following shell command to check if your operating system contains `node` and `npm`:

```sh
node -v; npm -v
```

If your system does not contain Node.js, download and install it from the [Node.js website](https://nodejs.org/en/).

You also need [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your computer. Installation instructions depend on your operating system — consult the [Git website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) for details.

#### Build TestCafe

1. [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the [TestCafe repository](https://github.com/DevExpress/testcafe).

2. Navigate to the root directory of the repository. To install dependencies, run the following shell command:

    ```sh
    npm install
    ```

3. Run the following shell command to build the project:
    ```sh
    npx gulp build
    ```

You now have two options to install TestCafe:

-   `npm link` is a useful option for testers and most other users. This command creates a [symbolic link](https://en.wikipedia.org/wiki/Symbolic_link) (symlink) that lets you use TestCafe while you make changes to its code.

-   `npm pack` creates a package that you can install with `npm install package_name`.

##### npm link

1. From the root of the `testcafe` directory, run the following shell command:

    ```sh
    npm link
    ```

2. Navigate to the directory that contains your test files and run the following shell command:

    ```sh
    npm link testcafe
    ```

##### Install from a package

1.  Run the following shell command to [package](https://docs.npmjs.com/cli/v7/commands/npm-pack) the framework:

    ```sh
    npm pack
    ```

    This command creates a `name-version.tgz` package in the `testcafe` folder.

2.  Run the following shell command to install the package globally. Replace the `path/to/package` part with the path to the package:

    ```sh
    npm install -g path/to/package
    ```

> [!NOTE]
> The `/lib` directory stores build artifacts. Build tasks remove this folder before they run. To remove this directory manually, run the following command:
>
> ```sh
> gulp clean
> ```

## Test New Versions of Testcafe

Before we publish new versions of TestCafe [on npm](https://www.npmjs.com/package/testcafe), we thoroughly test them. We invite you to participate in this process.

Please don't use the development version of TestCafe in production.

### Report Bugs and Issues

If you encounter a bug, check the [issue tracker](https://github.com/DevExpress/testcafe/issues) for an existing bug report. If no report for the issue exists, please file a new issue.

When you create a new issue, GitHub displays an issue template. Complete all sections of the template to help us understand the problem you are describing. Missing information could increase ticket processing time.

You are also welcome to [submit issues](https://github.com/DevExpress/testcafe/issues) relating to our [documentation](https://testcafe.io/documentation/402635/getting-started).

#### Create a Minimal Working Example

It is important to include a [Minimal Working Example](https://testcafe.io/402636/faq#how-to-create-a-minimal-working-example-when-you-submit-an-issue) (MWE) with your bug report. A good MWE ensures the issue is easy to reproduce and troubleshoot, while being as small and as simple as possible.

A Minimal Working Example should:

-   Be simple and easy to follow. Convoluted scenarios are hard to reproduce.
-   Exclude code that does not help reproduce the issue. Remove actions that do not affect the outcome.
-   Include a complete set of relevant data: the URL of the test page, the list of launch options, and the steps you follow to launch the tests.

For further information, refer to our [MWE guide](https://testcafe.io/402636/faq#how-to-create-a-minimal-working-example-when-you-submit-an-issue).

### Ask for Community Support

If you need help with TestCafe, or want to help other users, join the TestCafe community on Stack Overflow. Ask and answer [questions with the TestCafe tag](https://stackoverflow.com/questions/tagged/testcafe).

## Contribute Code

TestCafe expects contributor pull requests to meet certain standards. Complete the following tasks before you submit a pull request:

-   Include appropriate tests:

    -   If your code contains a bug fix, include regression tests.
    -   If your code introduces new capabilities, include unit tests and/or functional tests.

-   Run the following shell commands to fetch upstream changes and rebase your branch onto `master`:

    ```sh
    git checkout master
    git fetch upstream
    git merge upstream/master
    ```

-   Run the following shell commands to test the changes:

    ```sh
    gulp test-server
    gulp test-functional-local
    gulp test-client-local
    ```

-   Give the pull request a name that describes the changes you made.

-   If the pull request contains a bug fix, reference the issue that it [closes](https://github.blog/2013-05-14-closing-issues-via-pull-requests/) in the description.

-   The TestCafe package includes a linter and rules for that linter. Lint your code before you submit it.

Please keep in mind that the team may **suspend or reject** pull requests. There are multiple reasons why this can happen:

-   Failure to meet [code contribution](#contribute-code) requirements.
-   Poor quality code.
-   Other [development priorities](https://testcafe.io/402949/roadmap) may take precedence.

We merge pull requests after the changes are documented. If you want to document a new capability, add a comment with the description to the pull request. Review our [writing guidelines](#guidelines) before you proceed. 

## Contribute to Documentation

Users cannot submit documentation pull requests because TestCafe stores [documentation](https://testcafe.io/documentation) in a private repository. To notify the team of an inaccuracy in the documentation, create a [Github issue](https://github.com/DevExpress/testcafe/issues/new) with the `AREA: docs` label.

#### Guidelines

The TestCafe team adheres to a set of writing guidelines that make our documentation easy to read. Follow these rules when you submit written content:

-   Avoid gerunds, passive voice, and past tense.
-   Avoid double negatives.
-   Avoid misleading or ambiguous words and jargon.
-   Avoid vague and confusing references between pronouns and their antecedents.
-   Be descriptive rather than prescriptive.
-   Keep your sentences short and simple. Make sure that each sentence expresses only a single idea.
-   Do not repeat the same piece of information.
-   If possible, include interactive examples (codes samples, screenshots, etc.).