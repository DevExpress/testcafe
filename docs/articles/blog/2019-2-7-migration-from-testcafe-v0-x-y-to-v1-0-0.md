---
layout: post
title: Migration from TestCafe v0.x.y to v1.0.0
permalink: /blog/:title.html
---
# Migration from TestCafe v0.x.y to v1.0.0

TestCafe v1.0.0 release introduces minor changes to the behavior and programming interface. This document lists these changes and describes how to address them.

* [Test Syntax Validation Disabled: All Input Files Are Executed](#test-syntax-validation-disabled-all-input-files-are-executed)
* [Custom Request Hooks: Asynchronous API](#custom-request-hooks-asynchronous-api)
* [Custom Reporter Plugins: Asynchronous API](#custom-reporter-plugins-asynchronous-api)
* [Programming Interface: Multiple Method Calls Prohibited](#programming-interface-multiple-method-calls-prohibited)

## Test Syntax Validation Disabled: All Input Files Are Executed

Previous versions performed *test syntax validation* within input script files before executing them. Only files that contained the [fixture](../documentation/test-api/test-code-structure.md#fixtures) and [test](../documentation/test-api/test-code-structure.md#tests) directives were executed.

Starting with v1.0.0, input script files are **never** validated. This means that TestCafe executes all the scripts you specify as test sources. If you use Glob patterns to specify input test files, please recheck these patterns to avoid unintended file matches.

The `--disable-test-syntax-validation` command line flag and the `disableTestSyntaxValidation` option for the [runner.run](../documentation/using-testcafe/programming-interface/runner.md#run) API method that disabled test syntax validation were removed in v1.0.0.

## Custom Request Hooks: Asynchronous API

[Request hook](../documentation/test-api/intercepting-http-requests/README.md) methods became asynchronous in TestCafe v1.0.0.

If you use a [custom request hook](../documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.md), add the `async` keyword before the [onRequest](../documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.md#the-onrequest-method) and [onResponse](../documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.md#the-onresponse-method) methods.

```js
import { RequestHook } from 'testcafe';

class MyRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        super(requestFilterRules, responseEventConfigureOpts);
        // ...
    }
    async onRequest (event) {
        // ...
    }
    async onResponse (event) {
        // ...
    }
}
```

## Custom Reporter Plugins: Asynchronous API

TestCafe v1.0.0 also introduces asynchronous API for [reporter plugins](../documentation/extending-testcafe/reporter-plugin/README.md).

If you maintain a custom reporter plugin, add the `async` keyword before each reporter method:

* [reportTaskStart](../documentation/extending-testcafe/reporter-plugin/reporter-methods.md#reporttaskstart)
* [reportFixtureStart](../documentation/extending-testcafe/reporter-plugin/reporter-methods.md#reportfixturestart)
* [reportTestDone](../documentation/extending-testcafe/reporter-plugin/reporter-methods.md#reporttestdone)
* [reportTaskDone](../documentation/extending-testcafe/reporter-plugin/reporter-methods.md#reporttaskdone)

```js
async reportTaskStart (startTime, userAgents, testCount) {
    // ...
},
async reportFixtureStart (name, path, meta) {
    // ...
},
async reportTestDone (name, testRunInfo, meta) {
    // ...
},
async reportTaskDone (endTime, passed, warnings, result) {
    // ...
}
```

## Programming Interface: Multiple Method Calls Prohibited

Previous versions allowed you to call the [runner.src](../documentation/using-testcafe/programming-interface/runner.md#src), [runner.browsers](../documentation/using-testcafe/programming-interface/runner.md#browsers) and [runner.reporter](../documentation/using-testcafe/programming-interface/runner.md#reporter) methods several times to specify multiple test files, browsers or reporters.

```js
const stream = fs.createWriteStream('report.json');

runner
    .src('/home/user/tests/fixture1.js')
    .src('fixture5.js')
    .browsers('chrome')
    .browsers('firefox:headless')
    .reporter('minimal')
    .reporter('json', stream);
```

Starting with v1.0.0, pass arrays to these methods to specify multiple values.

To use a reporter that writes to a file, add a `{ name, output }` object to an array (see the [runner.reporter](../documentation/using-testcafe/programming-interface/runner.md#reporter) description for details).

```js
runner
    .src(['/home/user/tests/fixture1.js', 'fixture5.js'])
    .browsers(['chrome', 'firefox:headless'])
    .reporter(['minimal', { name: 'json', output: 'report.json' }]);
```