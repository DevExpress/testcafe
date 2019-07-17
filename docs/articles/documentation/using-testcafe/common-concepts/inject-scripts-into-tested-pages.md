---
layout: docs
title: Inject Scripts into Tested Pages
permalink: /documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html
---
# Inject Scripts into Tested Pages

TestCafe allows you to inject custom scripts into pages visited during the tests. You can add scripts that mock browser API or provide helper functions.

Use [test run options](#inject-scripts-in-all-tests) to enable injection in all tests, or [test API](#inject-scripts0in-specific-tests) to inject scripts for specific fixtures or tests.

## Inject Scripts in All Tests

Use either of the following to inject scripts in all tests:

* the [--cs (--client-scripts)](../command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option

    ```sh
    testcafe chrome test.js --client-scripts=mockDate.js,assets/react-helpers.js
    ```

* the [runner.clientScripts](../programming-interface/runner.md#clientscripts) API method

    ```js
    runner.clientScripts('mockDate.js', 'scripts/react-helpers.js');
    ```

* the [clientScripts](../configuration-file.md#clientscripts) configuration file property

    ```json
    {
        "clientScripts": ["mockDate.js", "scripts/react-helpers.js"]
    }
    ```

## Inject Scripts in Specific Tests

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

You can pass the following arguments to specify the scripts to inject:

* [path to a JavaScript file](#inject-a-javascript-file)
* [module name](#inject-a-module)
* [script code](#inject-script-code)

You can also [inject scripts into specific pages](#provide-scripts-for-specific-pages).

> Note that the API methods and configuration option support [multiple arguments](#specify-multiple-scripts).

### Inject a JavaScript File

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

> You cannot combine the `path`, [module](#inject-a-module) and [content](#inject-script-code) properties.

### Inject a Module

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
--------- | ------ | ----------------
`module`  | String | The module name.

TestCafe searches for the module's entry point with Node.js mechanisms and injects its content into the tested page.

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

> You cannot combine the `module`, [path](#inject-a-javascript-file) and [content](#inject-script-code) properties.

### Inject Script Code

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

> You cannot combine the `content`, [path](#inject-a-javascript-file) and [module](#inject-a-module) properties.

### Provide Scripts for Specific Pages

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

The [clientScripts](../configuration-file.md#clientscripts) configuration file property can also take arrays:

```json
{
    "clientScripts": ["vue-helpers.js", {
        "page": "https://mycorp.com/login/",
        "module": "lodash"
    }]
}
```

The [--cs (--client-scripts)](../command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option supports multiple arguments as well:

```sh
testcafe chrome test.js --client-scripts=mockDate.js,assets/react-helpers.js
```

Note that the `page`, `content` and `module` properties cannot take arrays. To inject multiple scripts into the same page, pass one argument for each script.

```js
const scripts = ['test1.js', 'test2.js', 'test3.js'];

runner.clientScripts(scripts.map(script => {
    path: script,
    page: 'http://example.com'
}));
```
