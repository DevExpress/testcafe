---
layout: docs
title: Inject Scripts into Tested Pages
permalink: /documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html
---
# Inject Scripts into Tested Pages

TestCafe allows you to inject custom scripts into pages visited during the tests. You can add scripts that mock browser API or provide helper functions.

Use [test run options](#set-injection-in-test-run-options) to enable injection in all tests, or [test API](#set-injection-in-test-api) to inject scripts for specific fixtures or tests.

## Set Injection in Test Run Options

Use either of the following to inject scripts in all tests:

* the [--cs (--client-scripts)](../command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line flag,

    ```sh
    testcafe chrome test.js --client-scripts=mockDate.js,assets/react-helpers.js
    ```

* the [runner.clientScripts](../programming-interface/runner.md#clientscripts) API method,

    ```js
    runner.clientScripts('mockDate.js', 'scripts/react-helpers.js');
    ```

* the [clientScripts](../configuration-file.md#clientscripts) configuration file property.

    ```json
    {
        "clientScripts": ["mockDate.js", "scripts/react-helpers.js"]
    }
    ```

## Set Injection in Test API

Use the [fixture.clientScripts](../../test-api/test-code-structure.md#inject-scripts-into-tested-pages) and [test.clientScripts](../../test-api/test-code-structure.md#inject-scripts-into-tested-pages) methods to inject scripts into pages visited during a particular test or fixture.

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

### Specify the Path to a JavaScript File

Specify the JavaScript file path to inject the entire content of this file into the tested pages. You can pass a string or an object with the `path` property.

*CLI*

```text
testcafe <browser> <tests> --cs <path>
```

*Programming interface*

```text
runner.clientScripts( path | { path } )
```

*Configuration file*

```text
{
    "clientScripts": "path" | { path }
}
```

*Test API*

```text
fixture.clientScripts( path | { path } )
test.clientScripts( path | { path } )
```

Argument  | Type   | Description
--------- | ------ | ---------------------------------------------------------------------------
`path`    | String | The path to the JavaScript file whose content should be injected.

**Examples**

```sh
testcafe chrome my-tests --cs assets/jquery.js
```

```js
runner.clientScripts('assets/jquery.js');
// or
runner.clientScripts({ path: 'assets/jquery.js' });
```

```js
{
    "clientScripts": "assets/jquery.js",
    // or
    "clientScripts": { "path": "assets/jquery.js" }
}
```

> You cannot combine the `path`, [module](#specify-the-module-name) and [content](#specify-the-script-code) properties.

### Specify the Module Name

Specify the module name to inject the module's content into the tested pages. Use a string or an object with the `module` property.

*CLI*

```text
testcafe <browser> <tests> --cs <module>
```

*Programming interface*

```text
runner.clientScripts( module | { module } )
```

*Configuration file*

```text
{
    "clientScripts": "module" | { module }
}
```

*Test API*

```text
fixture.clientScripts( module | { module } )
test.clientScripts( module | { module } )
```

Argument  | Type   | Description
--------- | ------ | ---------------------------------------------------------------------------
`module`  | String | The module name. TestCafe searches for the module's entry point with Node.js machinery and injects its content into the tested page.

**Examples**

```sh
testcafe chrome my-tests --cs lodash
```

```js
fixture `My fixture`
    .page `https://example.com`
    .clientScripts('lodash');

// or

fixture `My fixture`
    .page `https://example.com`
    .clientScripts({ module: 'lodash' });
```

```js
{
    "clientScripts": "lodash",
    // or
    "clientScripts": { "module": "lodash" }
}
```

> You cannot combine the `module`, [path](#specify-the-path-to-a-javascript-file) and [content](#specify-the-script-code) properties.

### Specify the Script Code

You can provide the injected script as a string with JavaScript code. Pass an object with the `content` property to do this.

*Programming interface*

```text
runner.clientScripts({ content })
```

*Configuration file*

```text
{
    "clientScripts": { content }
}
```

*Test API*

```text
fixture.clientScripts({ content })
test.clientScripts({ content })
```

Argument  | Type   | Description
--------- | ------ | ----------------------------------------
`content` | String | JavaScript code that should be injected.

**Examples**

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

> You cannot combine the `content`, [path](#specify-the-path-to-a-javascript-file) and [module](#specify-the-module-name) properties.

### Provide Scripts for Particular Pages

You can also specify pages into which a script should be injected. This is helpful when you need to use custom mocks on particular pages and preserve the default behavior everywhere else.

To specify target pages for a script, add the `page` property to the object you pass to `clientScripts`.

*Programming interface*

```text
runner.clientScripts({ page, path | module | content })
```

*Configuration file*

```text
{
    "clientScripts": { page, path | module | content }
}
```

*Test API*

```text
fixture.clientScripts({ page, path | module | content })
test.clientScripts({ page, path | module | content })
```

Property  | Type                | Description
--------- | ------------------- | ---------------------------------------------------------------------------
`page`    | String &#124; RegExp | Specify a page URL to add scripts to a single page, or a regular expression to add scripts to pages whose URLs match this expression. Regular expressions are not supported in the [clientScripts](../configuration-file.md#clientscripts) configuration file property.

**Examples**

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

### Pass Multiple Scripts

You can pass multiple arguments or an array to the `clientScripts` methods.

```js
fixture `My fixture`
    .page `https://example.com`
    .clientScripts('scripts/react-helpers.js', { content: 'Date.prototype.getTime = () => 42;' });
```

```json
{
    "clientScripts": ["vue-helpers.js", {
        "page": "https://mycorp.com/login/",
        "module": "lodash"
    }]
}
```

Note that the `page`, `content` and `module` properties cannot take arrays. To inject multiple scripts into the same page, pass one argument for each script.

```js
const scripts = ['test1.js', 'test2.js', 'test3.js'];

runner.clientScripts(scripts.map(script => {
    path: script,
    page: 'http://example.com'
}));
```
