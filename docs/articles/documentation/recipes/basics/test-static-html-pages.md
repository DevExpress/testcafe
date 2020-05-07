---
layout: docs
title: Test Static HTML Pages
permalink: /documentation/recipes/basics/test-static-html-pages.html
redirect_from:
  - /documentation/recipes/test-static-html-pages.html
---
# Test Static HTML Pages

There are many ways to test your static HTML pages using TestCafe, but in this recipe
we will focus on two simple methods that use a few other packages and can be easily integrated into your workflow.

* [Install TestCafe and create tests](#install-testcafe-and-create-tests)
* [Option 1 - Test webpages in the local file system](#option-1---test-webpages-in-the-local-file-system)
* [Option 2 - Set up a local HTTP server](#option-2---set-up-a-local-http-server)

## Install TestCafe and create tests

Install TestCafe [locally](../../guides/basic-guides/install-testcafe.md#local-installation) in your project and [create tests](../../getting-started/README.md#creating-a-test).

## Option 1 - Test webpages in the local file system

[Specify the target webpage](../../guides/basic-guides/organize-tests.md#specify-the-start-webpage) using a relative path or the `file://` URL scheme.

```js
fixture `My fixture`
    .page `file:///user/my-website/index.html`
```

```js
fixture `My fixture`
    .page `../my-website/index.html`
```

Add a command that runs tests to the `package.json` file.

```json
"scripts": {
    "test": "testcafe chrome ./test/acceptance/**"
}
```

This script runs tests from the `./test/acceptance/` directory in Chrome.

## Option 2 - Set up a local HTTP server

Install [http-server](https://github.com/indexzero/http-server) that will be used as a local server.

Use the `--app` TestCafe option to provide a command that starts the local server.
This command will be automatically executed before running tests. After tests are finished, TestCafe will stop the server.

Add the following code to `package.json`.

```json
"scripts": {
    "test": "testcafe chrome ./test/acceptance/** --app \"http-server ./my-website -s\""
}
```

This script contains the following commands.

1. `"http-server ./my-website -s"` - starts the local server at port `8080` with files from the `./my-website` folder in silent mode.
 The contents of the `./my-website` folder will be served at `http://localhost:8080`. So, if you want to test the `./my-website/dir/page.html` page,
 use `fixture('...').page('http://localhost:8080/dir/page.html')` in your fixture file.

2. `"testcafe chrome ./test/acceptance/**"` - runs TestCafe tests from the `./test/acceptance` directory in Chrome after the server starts

For more information on how to configure a test run using a `testcafe` command, see [Command Line Interface](../../reference/command-line-interface.md).
