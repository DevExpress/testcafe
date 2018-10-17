---
layout: post
title: TestCafe v0.21.0 Released
permalink: /blog/:title.html
---
# TestCafe v0.21.0 Released

Test web pages served over HTTPS, construct screenshot paths with patterns and use more info in custom reporters.

<!--more-->

## Enhancements

### ⚙ Test Web Pages Served Over HTTPS ([#1985](https://github.com/DevExpress/testcafe/issues/1985))

Some browser features (like [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), or [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)) require a secure origin. This means that the website should use the HTTPS protocol.

Starting with v0.21.0, TestCafe can serve proxied web pages over HTTPS. This allows you to test pages that require a secure origin.

To enable HTTPS when you use TestCafe through the command line, specify the [--ssl](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#--ssl-options) flag followed by the [HTTPS server options](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener). The most commonly used options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in the Node.js documentation.

```sh
testcafe --ssl pfx=path/to/file.pfx;rejectUnauthorized=true;...
```

When you use a programming API, pass the HTTPS server options to the [createTestCafe](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/createtestcafe.html) method.

```js
'use strict';

const createTestCafe        = require('testcafe');
const selfSignedSertificate = require('openssl-self-signed-certificate');
let runner                  = null;

const sslOptions = {
    key:  selfSignedSertificate.key,
    cert: selfSignedSertificate.cert
};

createTestCafe('localhost', 1337, 1338, sslOptions)
    .then(testcafe => {
        runner = testcafe.createRunner();
    })
    .then(() => {
        return runner
            .src('test.js')

            // Browsers restrict self-signed certificate usage unless you
            // explicitly set a flag specific to each browser.
            // For Chrome, this is '--allow-insecure-localhost'.
            .browsers('chrome --allow-insecure-localhost')
            .run();
    });
```

See [Connect to TestCafe Server over HTTPS](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/connect-to-the-testcafe-server-over-https.html) for more information.

### ⚙ Construct Screenshot Paths with Patterns ([#2152](https://github.com/DevExpress/testcafe/issues/2152))

You can now use patterns to construct paths to screenshots. TestCafe provides a number of placeholders you can include in the path, for example, `${DATE}`, `${TIME}`, `${USERAGENT}`, etc. For a complete list, refer to the command line [--screenshot-path-pattern flag description](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#-p---screenshot-path-pattern).

You specify a screenshot path pattern when you run tests. Each time TestCafe takes a screenshot, it substitutes the placeholders with actual values and saves the screenshot to the resulting path.

The following example shows how to specify a screenshot path pattern through the command line:

```sh
testcafe all test.js -s screenshots -p '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
```

When you use a programming API, pass the screenshot path pattern to the [runner.screenshots method](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#screenshots).

```js
runner.screenshots('reports/screenshots/', true, '${TEST_INDEX}/${OS}/${BROWSER}-v${BROWSER_VERSION}/${FILE_INDEX}.png');
```

### ⚙ Add Info About Screenshots and Quarantine Attempts to Custom Reports ([#2216](https://github.com/DevExpress/testcafe/issues/2216))

Custom reporters can now access screenshots' data and the history of quarantine attempts (if the test run in the quarantine mode).

The following information about screenshots is now available:

* the path to the screenshot file,
* the path to the thumbnail image,
* the user agent of the browser in which the screenshot was taken,
* the quarantine attempt number (if the screenshot was taken in the quarantine mode),
* whether the screenshot was taken because the test failed.

If the test was run in the quarantine mode, you can also determine which attempts failed and passed.

Refer to the [reportTestDone method description](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reporttestdone) for details on how to access this information.

## Bug Fixes

* HTML5 drag events are no longer simulated if `event.preventDefault` is called for the `mousedown` event ([#2529](https://github.com/DevExpress/testcafe/issues/2529))
* File upload no longer causes an exception when there are several file inputs on the page ([#2642](https://github.com/DevExpress/testcafe/issues/2642))
* File upload now works with inputs that have the `required` attribute ([#2509](https://github.com/DevExpress/testcafe/issues/2509))
* The `load` event listener is no longer triggered when added to an image ([testcafe-hammerhead/#1688](https://github.com/DevExpress/testcafe-hammerhead/issues/1688))
