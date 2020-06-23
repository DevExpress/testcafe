---
layout: post
title: TestCafe v0.20.0 Released
permalink: /blog/:title.html
---
# TestCafe v0.20.0 Released

Intercepting HTTP requests, specifying resources accessed by bypassing a proxy server, specifying testing metadata, deprecated passing a regular promise to assertions.

<!--more-->

## Request Hooks: Intercepting HTTP requests ([#1341](https://github.com/DevExpress/testcafe/issues/1341))

TestCafe now allows you to record HTTP request data or mock responses. You can also create a custom HTTP request hook to emulate authentications like  **Kerberos** or **Client Certificate Authentication**.

See [Intercepting HTTP Requests](../documentation/guides/advanced-guides/intercept-http-requests.md) for more information.

## Enhancements

### ⚙ Specifying resources accessed by bypassing a proxy server ([#1791](https://github.com/DevExpress/testcafe/issues/1791))

TestCafe now allows you to bypass the proxy server when accessing specific resources.

To specify resources that require direct access, use the [--proxy-bypass](../documentation/reference/command-line-interface.md#--proxy-bypass-rules) flag in the command line or the [useProxy](../documentation/reference/testcafe-api/runner/useproxy.md) API method's parameters.

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass localhost:8080,internal-resource.corp.mycompany.com
```

```js
runner.useProxy('172.0.10.10:8080', ['localhost:8080', 'internal-resource.corp.mycompany.com']);
```

### ⚙ Specifying testing metadata ([#2242](https://github.com/DevExpress/testcafe/issues/2242))

TestCafe allows you to specify additional information for tests in the form of key-value metadata and use it in reports.

You can define metadata for a fixture or a test using the [meta](../documentation/guides/basic-guides/organize-tests.md#specify-test-metadata) method:

```js
fixture `My Fixture`
    .meta('fixtureID', 'f-0001')
    .meta({ author: 'John', creationDate: '05/03/2018' });
```

```js
test
    .meta('testID', 't-0005')
    .meta({ severity: 'critical', testedAPIVersion: '1.0' })
    ('MyTest', async t => { /* ... */});
```

To include testing metadata to reports, use the [custom reporter methods](../documentation/reference/plugin-api/reporter.md).

### ⚙ Passing a regular promise to `t.expect` is deprecated now ([#2207](https://github.com/DevExpress/testcafe/issues/2207))

TestCafe now throws an error if you pass a regular promise to the assertion's `expect` method.

If you need to assert a regular promise, set the [allowUnawaitedPromise](../documentation/guides/basic-guides/assert.md#optionsallowunawaitedpromise) option to `true`.

```js
await t.expect(doSomethingAsync()).ok('check that a promise is returned', { allowUnawaitedPromise: true });
```

## Bug Fixes

* The session recovery bubble in Firefox is disabled ([#2341](https://github.com/DevExpress/testcafe/pull/2341))
* TestCafe works properly if a `body` element has the `pointer-events: none;` css style rule ([#2251](https://github.com/DevExpress/testcafe/issues/2251))
* Resizing Chrome in the emulation mode works correctly ([#2154](https://github.com/DevExpress/testcafe/issues/2154))
* The location port is used for service messages ([#2308](https://github.com/DevExpress/testcafe/pull/2308))
* A browser instance shuts down correctly on Unix systems ([#2226](https://github.com/DevExpress/testcafe/issues/2226))
* An `Integrity` attribute is removed from `script` and `link` tags ([testcafe-hammerhead/#235](https://github.com/DevExpress/testcafe-hammerhead/issues/235))
* The `event.preventDefault()` method call changes the `event.defaultPrevented` property value ([testcafe-hammerhead/#1588](https://github.com/DevExpress/testcafe-hammerhead/issues/1588))
* It is possible to set the `meta` element's `content` attribute ([testcafe-hammerhead/#1586](https://github.com/DevExpress/testcafe-hammerhead/issues/1586))
* TestCafe no longer overrides attributes used in a non-standard way with `null` ([testcafe-hammerhead/#1583](https://github.com/DevExpress/testcafe-hammerhead/pull/1583))
* The `Change` event fires correctly if the `target.value` changes ([#2319](https://github.com/DevExpress/testcafe/issues/2319))
* `MouseEvent.screenX` and `MouseEvent.screenY` are added to the emulated events ([#2325](https://github.com/DevExpress/testcafe/issues/2325))
* Cookies on `localhost` are processed correctly ([testcafe-hammerhead/#1491](https://github.com/DevExpress/testcafe-hammerhead/issues/1491))
* Setting the `//` url for an image works correctly ([#2312](https://github.com/DevExpress/testcafe/issues/2312))
* `shadowUI` internal elements are no longer processed ([#2281](https://github.com/DevExpress/testcafe/issues/2281))
* `typeInput` event is raised correctly ([#1956](https://github.com/DevExpress/testcafe/issues/1956))
* Selecting text in contenteditable elements works properly ([#2301](https://github.com/DevExpress/testcafe/issues/2301))
