---
layout: post
title: TestCafe v1.4.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.4.0 Released

This release introduces the capability to inject custom scripts into tested pages.

<!--more-->

## Enhancements

### ⚙ Inject Scripts Into Tested Pages ([#1739](https://github.com/DevExpress/testcafe/issues/1739))

TestCafe now allows you to [inject scripts](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html) into pages visited during the tests. Use this feature to add helper functions, mock browser API or import modules.

To add client scripts to all tests, specify them in the command line, API or configuration file. Use the following options:

* the [--cs (--client-scripts)](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#--cs-pathpath2---client-scripts-pathpath2) command line argument

    ```sh
    testcafe chrome test.js --client-scripts mockDate.js,assets/react-helpers.js
    ```

* the [runner.clientScripts](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#clientscripts) API method

    ```js
    runner.clientScripts('mockDate.js', 'scripts/react-helpers.js');
    ```

* the [clientScripts](https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html#clientscripts) configuration file property

    ```json
    {
        "clientScripts": ["mockDate.js", "scripts/react-helpers.js"]
    }
    ```

If you need to add scripts to individual fixtures or tests, use the [fixture.clientScripts](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#inject-scripts-into-tested-pages) and [test.clientScripts](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#inject-scripts-into-tested-pages) methods in test code.

```js
fixture `My fixture`
    .page `http://example.com`
    .clientScripts('mockDate.js', 'scripts/react-helpers.js');
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts('mockDate.js', 'scripts/react-helpers.js');
```

TestCafe also allows you to [inject scripts into specific pages](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html#provide-scripts-for-specific-pages).

```js
fixture `My fixture`
    .clientScripts({
        page: 'https://myapp.com/page/',
        path: 'scripts/vue-helpers.js'
    });
```

This is helpful when you need to override the browser API on particular pages and use the default behavior everywhere else.

You can specify the scripts to inject as follows:

* pass the [path to a JavaScript file](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html#inject-a-javascript-file) to inject its content:

    ```js
    fixture `My fixture`
        .clientScripts({ path: 'assets/jquery.js' });
    ```

* use the [module name](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html#inject-a-module) to inject a module:

    ```js
    fixture `My fixture`
        .clientScripts({ module: 'async' });
    ```

    TestCafe searches for the module's entry point with Node.js mechanisms and injects its content. Note that the browser must be able to execute this module.

* pass the [code](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html#inject-script-code) you need to inject:

    ```js
    fixture `My fixture`
        .clientScripts({ content: 'Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);' });
    ```

For more information, see [Inject Scripts into Tested Pages](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/inject-scripts-into-tested-pages.html).

## Bug Fixes

* The browser no longer displays 404 errors after the test submits a form ([#3560](https://github.com/DevExpress/testcafe/issues/3560)
* TestCafe can now download files when testing in headless mode ([#3127](https://github.com/DevExpress/testcafe/issues/3127))
* TypeScript no longer throws an error when `fixture` or `fixture.page` uses a tag function ([#4042](https://github.com/DevExpress/testcafe/issues/4042))
* The `load` event now correctly fires for cached images ([testcafe-hammerhead/#1959](https://github.com/DevExpress/testcafe-hammerhead/issues/1959))
* TestCafe can now read resources from `asar` archives ([testcafe-hammerhead/#2033](https://github.com/DevExpress/testcafe-hammerhead/issues/2033))
* Fixed a bug when `testcafe-hammerhead` event listeners were called twice ([testcafe-hammerhead/#2062](https://github.com/DevExpress/testcafe-hammerhead/issues/2062))
