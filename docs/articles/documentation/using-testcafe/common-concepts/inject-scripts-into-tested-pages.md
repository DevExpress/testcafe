---
layout: docs
title: Inject Scripts into Tested Pages
permalink: /documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html
---
# Inject Scripts into Tested Pages

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

* the [--cs (--client-scripts)](../command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option

    ```sh
    testcafe chrome test.js --client-scripts mockDate.js,assets/react-helpers.js
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

## Add Client Scripts to Specific Tests

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

You can also [inject scripts into specific pages](#provide-scripts-for-specific-pages) and [iframes](#inject-scripts-into-iframes).

> Note that the API methods and configuration option support [multiple arguments](#specify-multiple-scripts).

### Inject a JavaScript File

Specify the JavaScript file path to inject the content of this file into the tested pages. You can pass a string or object with the `path` property.

*CLI*

```text
testcafe <browser> <tests> --cs <filePath>[,<filePath2>,...<filePathN>]
```

*Programming interface*

```text
runner.clientScripts(filePath | { path: filePath })
runner.clientScripts(filePath | { path: filePath }, ...)
runner.clientScripts([ filePath | { path: filePath } ])
```

*Configuration file*

```text
{
    "clientScripts": "<filePath>" | { "path": "<filePath>" }
}
{
    "clientScripts": [ "<filePath>" | { "path": "<filePath>" } ]
}
```

*Test API*

```text
fixture.clientScripts(filePath | { path: filePath })
fixture.clientScripts(filePath | { path: filePath }, ...)
fixture.clientScripts([ filePath | { path: filePath } ])
```

```text
test.clientScripts(filePath | { path: filePath })
test.clientScripts(filePath | { path: filePath }, ...)
test.clientScripts([ filePath | { path: filePath } ])
```

Argument   | Type   | Description
---------- | ------ | ---------------------------------------------------------------------------
`filePath`, `filePath2`, `filePathN` | String | The path to the JavaScript file whose content should be injected.

#### Relative Paths

Relative paths are resolved against the *current working directory* when you inject scripts in:

* [command line interface](../command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2)
* [programming interface](../programming-interface/runner.md#clientscripts)
* [configuration file](../configuration-file.md#clientscripts)

When you use [test API methods](../../test-api/test-code-structure.md#inject-scripts-into-tested-pages), relative paths are resolved against the *test file location*.

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

> You cannot combine the `path`, [module](#inject-a-module) and [content](#inject-script-code) properties in a single object. To inject multiple items, pass several arguments or an array.

### Inject a Module

Specify the Node.js module's name to inject its content into the tested pages. Use an object with the `module` property.

*Programming interface*

```text
runner.clientScripts( { module: moduleName } )
runner.clientScripts( { module: moduleName }, ... )
runner.clientScripts([ { module: moduleName } ])
```

*Configuration file*

```text
{
    "clientScripts": { "module": "<moduleName>" }
}
{
    "clientScripts": [ { "module": "<moduleName>" } ]
}
```

*Test API*

```text
fixture.clientScripts( { module: moduleName } )
fixture.clientScripts( { module: moduleName }, ... )
fixture.clientScripts([ { module: moduleName } ])
```

```text
test.clientScripts( { module: moduleName } )
test.clientScripts( { module: moduleName }, ... )
test.clientScripts([ { module: moduleName } ])
```

Argument  | Type   | Description
--------- | ------ | ----------------
`moduleName`  | String | The module name.

TestCafe uses Node.js mechanisms to search for the module's entry point and injects its content into the tested page.

Note that the browser must be able to execute the injected module. For example, modules that implement the [UMD](https://github.com/umdjs/umd) API can run in most modern browsers.

> If the injected module has dependencies, ensure that the dependencies can be loaded as global variables and these variables are initialized in the page's code.

**Examples**

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

> You cannot combine the `module`, [path](#inject-a-javascript-file) and [content](#inject-script-code) properties in a single object. To inject multiple items, pass several arguments or an array.

### Inject Script Code

You can pass an object with the `content` property to provide the injected script as a string.

*Programming interface*

```text
runner.clientScripts({ content: code })
runner.clientScripts({ content: code }, ...)
runner.clientScripts([ { content: code } ])
```

*Configuration file*

```text
{
    "clientScripts": { "content": "<code>" }
}
{
    "clientScripts": [ { "content": "<code>" } ]
}
```

*Test API*

```text
fixture.clientScripts({ content: code })
fixture.clientScripts({ content: code }, ...)
fixture.clientScripts([ { content: code } ])
```

```text
test.clientScripts({ content: code })
test.clientScripts({ content: code }, ...)
test.clientScripts([ { content: code } ])
```

Argument  | Type   | Description
--------- | ------ | ----------------------------------------
`code` | String | JavaScript that should be injected.

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

> You cannot combine the `content`, [path](#inject-a-javascript-file) and [module](#inject-a-module) properties in a single object. To inject multiple items, pass several arguments or an array.

### Provide Scripts for Specific Pages

You can also specify pages into which a script should be injected. For instance, this enables you to mock browser API on particular pages and use the default behavior everywhere else.

To specify target pages for a script, add the `page` property to the object you pass to `clientScripts`.

*Programming interface*

```text
runner.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
})

runner.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
}, ...)

runner.clientScripts([
    {
        page: url,
        path: filePath | module: moduleName | content: code
    }
])
```

*Configuration file*

```text
{
    "clientScripts": {
        "page": "<url>",
        "path": "<filePath>" | "module": "<moduleName>" | "content": "<code>"
    }
}
{
    "clientScripts": [
        {
            "page": "<url>",
            "path": "<filePath>" | "module": "<moduleName>" | "content": "<code>"
        }
    ]
}
```

*Test API*

```text
fixture.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
})

fixture.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
}, ...)

fixture.clientScripts([
    {
        page: url,
        path: filePath | module: moduleName | content: code
    }
])
```

```text
test.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
})

test.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
}, ...)

test.clientScripts([
    {
        page: url,
        path: filePath | module: moduleName | content: code
    }
])
```

Property  | Type                | Description
--------- | ------------------- | ---------------------------------------------------------------------------
`url`    | String &#124; RegExp | Specify a page URL to add scripts to a page, or a regular expression to add scripts to pages whose URLs match this expression. Regular expressions are not supported in the [clientScripts](../configuration-file.md#clientscripts) configuration file property.

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

> If the target page redirects to a different URL, ensure that the `page` property matches the destination URL. Otherwise, scripts are not injected.

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
