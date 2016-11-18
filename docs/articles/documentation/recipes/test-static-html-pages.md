---
layout: docs
title: Running Tests Locally
permalink: /documentation/recipes/test-static-html-pages.html
---
# Test Static Html Pages

There are many ways to test your static html pages using TestCafe, but in this recipe we will focus on a simple one that uses a few other packages and can be easily integrated into your workflow. To do this, go through the following steps.

* [Step 1 - Install TestCafe and create tests](#step-1---install-testcafe-and-create-tests)
* [Step 2 - Install http-server and concurrently](#step-2---install-http-server-and-concurrently)
* [Step 3 - Add the `test` script to package.json](#step-3---add-the-test-script-to-packagejson)

## Step 1 - Install TestCafe and create tests

Install TestCafe [locally](../using-testcafe/installing-testcafe.md#locally) in your project and [create tests](../getting-started/#creating-a-test).

## Step 2 - Install http-server and concurrently

* Install [http-server](https://github.com/indexzero/http-server) that will be our local server
* Install [concurrently](https://github.com/kimmobrunfeldt/concurrently) that will be responsible for running both the server and TestCafe at the same time and before exiting, to finish the server process.

## Step 3 - Add the `test` script to package.json

The default test script, for Node.js projects is `npm test`.
To tell npm how to run your tests, you need to add the `test` script to the project's package.json file. The script should contain a `concurrently` command that will handle the local server and TestCafe.

```json
"scripts": {
    "test": "concurrently -r -k \"http-server\" \"http-server ./dist -p 4000 -s\" \"testcafe chrome ./test/acceptance/**\""
}
```

This script contains the following commands.

1. `concurrently -r -k "http-server"` - starts concurrently with the raw output flag on and kills the http-server after running the tests
2. `"http-server ./dist -p 4000 -s"` - starts the local server at port `4000` on the `./dist folder` in silent mode
3. `"testcafe chrome ./test/acceptance/**"` - runs TestCafe tests on the `./test/acceptance` folder on Chrome

For more information on how to configure a test run using a `testcafe` command, see [Command Line Interface](../using-testcafe/command-line-interface.md).
