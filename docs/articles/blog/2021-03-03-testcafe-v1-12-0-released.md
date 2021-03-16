---
layout: post
title: TestCafe v1.12.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.12.0 Released

This version brings server-side caching, asynchronous predicates, and multiple bugfixes.

<!--more-->

## Enhancements

### ⚙ Server-Side Web Assets Caching ([testcafe-hammerhead/#863](https://github.com/DevExpress/testcafe-hammerhead/issues/863))

TestCafe's proxy server can now cache web assets (like images, scripts, videos). When TestCafe revisits the website later, it can load assets from cache. This helps to avoid repetitive network requests, which saves time.

Use any of the following to enable server-side caching:

* [the `--cache` CLI flag](../documentation/reference/command-line-interface.md#--cache)
* [the `cache` configuration file property](../documentation/reference/configuration-file.md#cache)
* [the `createTestCafe` function parameter](../documentation/reference/testcafe-api/global/createtestcafe.md)

### Initialize Request Hooks with Async Predicates

The following request hooks now support **asynchronous** predicate functions:

* [RequestHook](../documentation/reference/test-api/requesthook/constructor.md#filter-with-a-predicate)
* [RequestMock.onRequestTo](../documentation/reference/test-api/requestmock/onrequestto.md#filter-with-a-predicate)
* [RequestLogger](../documentation/reference/test-api/requestlogger/constructor.md#filter-with-a-predicate)

**Example**

```js
const logger = RequestLogger(async request => {
    return await someFn();
});
```

## Bug Fixes

* Fixed a bug where TestCafe was unable to switch to the main window before/after interacting with a child window ([#5930](https://github.com/DevExpress/testcafe/issues/5930))
* Fixed the `Illegal invocation` error when calling `Storage.prototype` methods on the `StorageWrapper` object ([#2526](https://github.com/DevExpress/testcafe-hammerhead/issues/2526))
