---
layout: post
title: Migration from TestCafe v0.x.y to v1.0.0
permalink: /blog/:title.html
---
# Migration from TestCafe v0.x.y to v1.0.0

TestCafe v1.0.0 introduces minor changes to the framework's behavior and programming interface. This document lists these changes and describes how to migrate to the new version.

<!--more-->

* [Test Syntax Validation Disabled: All Input Files Are Executed](#test-syntax-validation-disabled-all-input-files-are-executed)
* [Custom Request Hooks: Asynchronous API](#custom-request-hooks-asynchronous-api)
* [Custom Reporter Plugins: Asynchronous API](#custom-reporter-plugins-asynchronous-api)
* [Programming Interface: Multiple Method Calls Prohibited](#programming-interface-multiple-method-calls-prohibited)

## Test Syntax Validation Disabled: All Input Files Are Executed

Previous versions performed *test syntax validation* within input script files before executing them. Only files that contained the [fixture](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#fixtures) and [test](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#tests) directives were executed.

Starting with v1.0.0, input script files are **not** validated. This means that TestCafe executes all the scripts you specify as test sources. If you use Glob patterns to specify input test files, please recheck these patterns to avoid unintended file matches.

The `--disable-test-syntax-validation` command line flag and the `disableTestSyntaxValidation` option for the [runner.run](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#run) API method that disabled test syntax validation were removed in v1.0.0.

### What Has Improved

You can now load tests dynamically without additional customization. The following example illustrates how tests can be imported from an external library:

**external-lib.js**

```js
export default function runFixture(name, url) {
    fixture(name)
        .page(url);

    test(`${url} test`, async t => {
        // ...
    });
}
```

**test.js**

```js
import runFixture from './external-lib';

const fixtureName = 'My fixture';
const url = 'https://testPage';

runFixture(fixtureName, url);
```

## Programming Interface: Multiple Method Calls Prohibited

Previous versions allowed you to call the [runner.src](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#src), [runner.browsers](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#browsers) and [runner.reporter](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#reporter) methods several times to specify multiple test files, browsers or reporters.

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

To use a reporter that writes to a file, add a `{ name, output }` object to an array (see the [runner.reporter](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#reporter) description for details).

```js
runner
    .src(['/home/user/tests/fixture1.js', 'fixture5.js'])
    .browsers(['chrome', 'firefox:headless'])
    .reporter(['minimal', { name: 'json', output: 'report.json' }]);
```

### What Has Improved

The [configuration file](https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html) we implemented is consistent with the API and command line interface.

## Custom Request Hooks: Asynchronous API

[Request hook](https://devexpress.github.io/testcafe/documentation/test-api/intercepting-http-requests/) methods became asynchronous in TestCafe v1.0.0.

If the [onRequest](https://devexpress.github.io/testcafe/documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.html#the-onrequest-method) or [onResponse](https://devexpress.github.io/testcafe/documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.html#the-onresponse-method) method in your custom hook returns a Promise, TestCafe now waits for this Promise to resolve.

You should add the `async` keyword to the asynchronous [onRequest](https://devexpress.github.io/testcafe/documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.html#the-onrequest-method) and [onResponse](https://devexpress.github.io/testcafe/documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.html#the-onresponse-method) method declarations.

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

### What Has Improved

You can call asynchronous [fs](https://nodejs.org/api/fs.html) functions, invoke a [child_process](https://nodejs.org/api/child_process.html), or perform asynchronous network requests (to a database or any other server) from inside the hooks.

## Custom Reporter Plugins: Asynchronous API

TestCafe v1.0.0 also introduces an asynchronous API for [reporter plugins](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/).

Similarly to [request hooks](#custom-request-hooks-asynchronous-api), if any of the custom reporter's methods ([reportTaskStart](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reporttaskstart), [reportFixtureStart](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reportfixturestart), [reportTestDone](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reporttestdone) or [reportTaskDone](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reporttaskdone)) returns a Promise, this Promise is now awaited.

Since the reporter methods are now asynchronous, add the `async` keyword to their declarations.

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

### What Has Improved

Reporters can call asynchronous [fs](https://nodejs.org/api/fs.html) functions, invoke a [child_process](https://nodejs.org/api/child_process.html), or perform asynchronous network requests (to send an email, use REST API, connect to a database, etc).