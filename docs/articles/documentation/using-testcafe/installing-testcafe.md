---
layout: docs
title: Installing TestCafe
permalink: /documentation/using-testcafe/installing-testcafe.html
checked: false
---
# Installing TestCafe

You can install TestCafe globally or locally in your project.

## Globally

```bash
npm install -g testcafe
```

After that, you can run TestCafe from a [command line](command-line-interface.html) by using the `testcafe` command.

```bash
testcafe chrome tests/
```

## Locally

The following command will install TestCafe into your project directory and save it on the dependencies list.

```bash
npm install --save-dev testcafe
```

The local installation is preferred for continuous integration scenarios or if you are going to use TestCafe from a Node.js application (see [Programming Interface](programming-interface/index.html)). This kind of installation has two advantages.

* It makes your project setup easier: running `npm install` in the project directory will automatically install TestCafe as well.
* Different projects can depend on different versions of TestCafe.

You can use the local version of TestCafe from a [command line](command-line-interface.html) as well. To run it, use one of the following ways.

* By using [npm scripts](https://docs.npmjs.com/misc/scripts).

    For example, you can add the `testcafe` command to the `scripts` section of the package.json file in the following way.

    ```js
    "scripts": { "test": "testcafe chrome tests/" }
    ```

    After that, you can run TestCafe by using the `npm test` command.

* If TestCafe is installed locally as well as globally, you can simply use the `testcafe` command. The local version will run automatically.

    ```bash
    testcafe chrome tests/
    ```