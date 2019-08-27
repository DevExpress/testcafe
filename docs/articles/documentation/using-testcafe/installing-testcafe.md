---
layout: docs
title: Installing TestCafe
permalink: /documentation/using-testcafe/installing-testcafe.html
---
# Installing TestCafe

You can install TestCafe from `npm` globally or locally in your project.

* [Global Installation](#global-installation)
* [Local Installation](#local-installation)

## Global Installation

```bash
npm install -g testcafe
```

After that, use the [testcafe](command-line-interface.md) command to run TestCafe from the command line.

```bash
testcafe chrome tests/
```

## Local Installation

The following command installs TestCafe into your project directory and saves it on the dependencies list.

```bash
npm install --save-dev testcafe
```

Local installation is preferred for continuous integration systems or [Node.js API](programming-interface/README.md).

* Local installation makes your project setup easier: `npm install` executed in the project directory installs all dependencies including TestCafe.
* Different projects can use different TestCafe versions.

To run a local TestCafe version from the [command line](command-line-interface.md), use one of the following methods:

* the [npx](https://www.npmjs.com/package/npx) command:

    ```sh
    npx testcafe chrome tests/
    ```

* the [yarn run](https://yarnpkg.com/lang/en/docs/cli/run/) command:

    ```sh
    yarn run testcafe chrome tests/
    ```

* [npm scripts](https://docs.npmjs.com/misc/scripts) - add the `testcafe` command to the `scripts` section in `package.json`:

    ```json
    "scripts": {
        "test": "testcafe chrome tests/"
    }
    ```

    Then use `npm test` to run the specified TestCafe command:

    ```sh
    npm test
    ```

* If TestCafe is installed both locally and globally, the `testcafe` command runs the local version:

    ```bash
    testcafe chrome tests/
    ```
