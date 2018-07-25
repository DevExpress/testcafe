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

Some browser features (like [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), or [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)) require a secure origin. This means that the website should be served over the HTTPS protocol.

Starting with v0.21.0, TestCafe can serve proxied web pages over HTTPS. This allows you to test pages that require a secure origin.

To enable HTTPS when you use TestCafe through the command line, specify the [--ssl](../documentation/using-testcafe/command-line-interface.md#--ssl-options) flag followed by the [HTTPS server options](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener). The most commonly used options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in the Node.js documentation.

```sh
testcafe --ssl pfx=path/to/file.pfx;rejectUnauthorized=true;...
```

When you use programming API, pass the HTTPS server options to the [createTestCafe](../documentation/using-testcafe/programming-interface/createtestcafe.md) method.

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

See [Connect to TestCafe Server over HTTPS](../documentation/using-testcafe/common-concepts/connect-to-the-testcafe-server-over-https.md) for more information.

### ⚙ Construct Screenshot Paths with Patterns ([#2152](https://github.com/DevExpress/testcafe/issues/2152))

You can now use patterns to construct paths to screenshots. TestCafe provides a number of placeholders you can include in the path. For instance, these are `${DATE}`, `${TIME}`, `${USERAGENT}`, etc. For a complete list, refer to the command line [--screenshot-path-pattern flag description](../documentation/using-testcafe/command-line-interface.md#-p---screenshot-path-pattern).

You specify a screenshot path pattern when you run tests. Each time TestCafe takes a screenshot, it substitutes the placeholders with actual values and saves the screenshot to the resulting path.

The following example shows how to specify a screenshot path pattern through the command line.

```sh
testcafe all test.js -s screenshots -p "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
```

When you use programming API, pass the screenshot path pattern to the [runner.screenshots method](../documentation/using-testcafe/programming-interface/runner.md#screenshots).

```js
runner.screenshots('reports/screenshots/', true, '${TEST_INDEX}/${OS}/${BROWSER}-v${BROWSER_VERSION}/${FILE_INDEX}.png');
```

### ⚙ Add Info About Screenshots and Quarantine Attempts to Custom Reports ([#2216](https://github.com/DevExpress/testcafe/issues/2216))

Custom reporters can now access data about screenshots and the history of quarantine attempts (if the test ran in the quarantine mode).

The following info about screenshots is now available:

* the path to the screenshot file,
* the path to the thumbnail image,
* the user agent of the browser in which the screenshot was taken,
* the quarantine attempt number (if the screenshot was taken in the quarantine mode),
* whether the screenshot was taken because the test failed.

If the test ran in the quarantine mode, you can also determine at which attempts it failed and at which it passed.

Refer to the [reportTestDone method description](../documentation/extending-testcafe/reporter-plugin/reporter-methods.md#reporttestdone) to learn how to access new information.

## Bug Fixes

* The Drag action now works correctly in specific cases ([#2529](https://github.com/DevExpress/testcafe/issues/2529))
