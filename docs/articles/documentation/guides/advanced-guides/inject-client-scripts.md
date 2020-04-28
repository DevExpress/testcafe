---
layout: docs
title: Inject Client Scripts
permalink: /documentation/guides/advanced-guides/inject-client-scripts.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html
---
# Inject Client Scripts

TestCafe allows you to inject custom client scripts into pages visited during the tests. You can add scripts that mock browser API or provide helper functions.

* [Add Client Scripts to All Tests](#add-client-scripts-to-all-tests)
* [Add Client Scripts to Specific Tests](#add-client-scripts-to-specific-tests)
* [Provide Scripts to Inject](#provide-scripts-to-inject)
  * [Inject a JavaScript File](#inject-a-javascript-file)
  * [Inject a Module](#inject-a-module)
  * [Inject Script Code](#inject-script-code)
  * [Provide Scripts for Specific Pages](#provide-scripts-for-specific-pages)
  * [Inject Scripts Into Iframes](#inject-scripts-into-iframes)
  * [Specify Multiple Scripts](#specify-multiple-scripts)
* [Access DOM in the Injected Scripts](#access-dom-in-the-injected-scripts)

Use [test run options](#add-client-scripts-to-all-tests) to add client scripts to all tests, or [test API](#add-client-scripts-to-specific-tests) to add them to specific fixtures or tests.

## Add Client Scripts to All Tests

Use either of the following options to inject scripts into pages visited during all the tests:

* the [--cs (--client-scripts)](../../reference/command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option

    ```sh
    testcafe chrome test.js --client-scripts mockDate.js,assets/react-helpers.js
    ```

* the [runner.clientScripts](../../reference/testcafe-api/runner/clientscripts.md) API method

    ```js
    runner.clientScripts('mockDate.js', 'scripts/react-helpers.js');
    ```

* the [clientScripts](../../reference/configuration-file.md#clientscripts) configuration file property

    ```json
    {
        "clientScripts": ["mockDate.js", "scripts/react-helpers.js"]
    }
    ```

## Add Client Scripts to Specific Tests

Use the [fixture.clientScripts](../../reference/test-api/fixture/clientscripts.md) and [test.clientScripts](../../reference/test-api/test/clientscripts.md) methods to inject scripts into pages visited during a test or fixture.

```js
fixture `My fixture`
    .page `http://example.com`
    .clientScripts('assets/jquery.js');
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({ module: 'async' });
```

## Provide Scripts to Inject

You can pass the following arguments to specify the scripts to inject:

* [path to a JavaScript file](#inject-a-javascript-file)
* [module name](#inject-a-module)
* [script code](#inject-script-code)

You can also [inject scripts into specific pages](#provide-scripts-for-specific-pages) and [iframes](#inject-scripts-into-iframes).

> Note that the API methods and configuration options support [multiple arguments](#specify-multiple-scripts).

### Inject a JavaScript File

Specify the JavaScript file path to inject the content of this file into the tested pages. You can pass a string or object with the `path` property.

```sh
testcafe chrome my-tests --cs assets/jquery.js
```

```js
runner.clientScripts('assets/jquery.js');
```

```js
{
    "clientScripts": "assets/jquery.js"
}
```

See the details for:

* [command line interface](../../reference/command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2),
* [programming interface](../../reference/testcafe-api/runner/clientscripts.md#inject-a-javascript-file),
* [configuration file](../../reference/configuration-file.md#inject-a-javascript-file),
* test API: [fixture.clientScripts](../../reference/test-api/fixture/clientscripts.md#inject-a-javascript-file), [test.clientScripts](../../reference/test-api/test/clientscripts.md#inject-a-javascript-file).

### Inject a Module

Specify the Node.js module's name to inject its content into the tested pages. Use an object with the `module` property.

```js
fixture `My fixture`
    .page `https://example.com`
    .clientScripts({ module: 'lodash' });
```

```js
{
    "clientScripts": {
        "module": "lodash"
    }
}
```

TestCafe uses Node.js mechanisms to search for the module's entry point and injects its content into the tested page.

Note that the browser must be able to execute the injected module. For example, modules that implement the [UMD](https://github.com/umdjs/umd) API can run in most modern browsers.

See details for:

* [programming interface](../../reference/testcafe-api/runner/clientscripts.md#inject-a-module),
* [configuration file](../../reference/configuration-file.md#inject-a-module),
* test API: [fixture.clientScripts](../../reference/test-api/fixture/clientscripts.md#inject-a-module), [test.clientScripts](../../reference/test-api/test/clientscripts.md#inject-a-module).

### Inject Script Code

You can pass an object with the `content` property to provide the injected script as a string.

```js
const mockDate = `
    Date.prototype.getTime = function () {
        return 42;
    };
`;

test
    ('My test', async t => { /* ... */ })
    .clientScripts({ content: mockDate });
```

```json
{
    "clientScripts": {
        "content": "Date.prototype.getTime = () => 42;"
    }
}
```

See the details for:

* [programming interface](../../reference/testcafe-api/runner/clientscripts.md#inject-script-code),
* [configuration file](../../reference/configuration-file.md#inject-script-code),
* test API: [fixture.clientScripts](../../reference/test-api/fixture/clientscripts.md#inject-script-code), [test.clientScripts](../../reference/test-api/test/clientscripts.md#inject-script-code).

### Provide Scripts for Specific Pages

You can also specify pages into which a script should be injected. This will allow you to mock browser API on specified pages and use the default behavior everywhere else.

To specify target pages for a script, add the `page` property to the object you pass to `clientScripts`.

```js
runner.clientScripts({
    page: /\/user\/profile\//,
    path: 'dist/jquery.js'
});
```

```json
{
    "clientScripts": {
        "page": "https://myapp.com/page/",
        "content": "Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);"
    }
}
```

See the details for:

* [programming interface](../../reference/testcafe-api/runner/clientscripts.md#provide-scripts-for-specific-pages),
* [configuration file](../../reference/configuration-file.md#provide-scripts-for-specific-pages),
* test API: [fixture.clientScripts](../../reference/test-api/fixture/clientscripts.md#provide-scripts-for-specific-pages), [test.clientScripts](../../reference/test-api/test/clientscripts.md#provide-scripts-for-specific-pages).

### Inject Scripts Into Iframes

To inject a script into an iframe, specify the iframe URL in the [page](#provide-scripts-for-specific-pages) property.

```js
runner.clientScripts({
    path: 'scripts/helpers.js',
    page: 'https://example.com/iframe/'
}));
```

### Specify Multiple Scripts

You can pass multiple arguments or an array to the `clientScripts` methods:

```js
fixture `My fixture`
    .page `https://example.com`
    .clientScripts('scripts/react-helpers.js', { content: 'Date.prototype.getTime = () => 42;' });
```

```js
runner.clientScripts(['scripts/react-helpers.js', 'dist/jquery.js']);
```

The [clientScripts](../../reference/configuration-file.md#clientscripts) configuration file property can also take arrays:

```json
{
    "clientScripts": ["vue-helpers.js", {
        "page": "https://mycorp.com/login/",
        "module": "lodash"
    }]
}
```

The [--cs (--client-scripts)](../../reference/command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option supports multiple arguments as well:

```sh
testcafe chrome test.js --client-scripts mockDate.js,assets/react-helpers.js
```

Note that the `page`, `content` and `module` properties cannot take arrays. To inject multiple scripts into the same page, pass one argument for each script.

```js
const scripts = ['test1.js', 'test2.js', 'test3.js'];

runner.clientScripts(scripts.map(script => {
    path: script,
    page: 'http://example.com'
}));
```

## Access DOM in the Injected Scripts

TestCafe injects custom scripts into the `head` tag. These scripts are executed before the DOM is loaded.

To access the DOM in these scripts, wait until the `DOMContentLoaded` event fires:

```js
const scriptContent = `
window.addEventListener('DOMContentLoaded', function () {
    document.body.style.backgroundColor = 'green';
});
`;

fixture `My fixture`
    .clientScripts({ content: scriptContent });
```
