---
layout: docs
title: Test Static HTML Pages
permalink: /documentation/recipes/test-static-html-pages.html
---
# Test Static HTML Pages

There are many ways to test your static HTML pages using TestCafe, but in this recipe we will focus on a simple one that uses a few other packages and can be easily integrated into your workflow. To do this, go through the following steps.

* [Step 1 - Install TestCafe and create tests](#step-1---install-testcafe-and-create-tests)
* [Step 2 - Install http-server](#step-2---install-http-server)
* [Step 3 - Add the `test` script to package.json](#step-3---add-the-test-script-to-packagejson)

## Step 1 - Install TestCafe and create tests

Install TestCafe [locally](../using-testcafe/installing-testcafe.md#locally) in your project and [create tests](../getting-started/README.md#creating-a-test).

## Step 2 - Install http-server

Install [http-server](https://github.com/indexzero/http-server) that will be used as a local server.

## Step 3 - Add the `test` script to package.json

The default test script, for Node.js projects is `npm test`.
To tell npm how to run your tests, add the `test` script to the project's package.json file.
Use the `--app` TestCafe option to provide a command that starts the local server.
This command will be automatically executed before running tests. After tests are finished, TestCafe will stop the server.

```json
"scripts": {
    "test": "testcafe chrome ./test/acceptance/** --app \"http-server ./dist -s\""
}
```

This script contains the following commands.

1. `"http-server ./dist -s"` - starts the local server at port `8080` with files from the `./dist` folder in silent mode.
 The contents of the`./dist` folder will be served at `http://localhost:8080`. So, if you want to test the `./dist/dir/page.html` page,
 use `fixture('...').page('http://localhost:8080/dir/page.html')` in your fixture file.

2. `"testcafe chrome ./test/acceptance/**"` - runs TestCafe tests from the `./test/acceptance` folder in Chrome after the server starts

For more information on how to configure a test run using a `testcafe` command, see [Command Line Interface](../using-testcafe/command-line-interface.md).
