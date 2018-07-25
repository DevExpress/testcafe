---
layout: docs
title: Connect to the TestCafe Server over HTTPS
permalink: /documentation/using-testcafe/common-concepts/connect-to-the-testcafe-server-over-https.html
---
# Connect to TestCafe Server over HTTPS

TestCafe is a proxy-based testing tool. Browser requests are sent via the TestCafe proxy server to the tested website. All requests between the browser and the TestCafe server are sent over the HTTP protocol.

![Connection Protocols](../../../images/proxy-connection-protocols.svg)

Some browser features (like
[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API),
[ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), or
[SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto))
require a secure origin. This means that the website should use the HTTPS protocol. If TestCafe proxies such websites through HTTP, tests fail because of JavaScript errors.

TestCafe can serve the proxied tested page over the HTTPS protocol. When this option is enabled, the client browser uses HTTPS to connect to the TestCafe proxy server. This allows you to test web pages with browser features that require a secure origin.

To enable HTTPS, use the [--ssl](../command-line-interface.md#--ssl-options) flag when you run tests from the command line. Specify options required to initialize
[a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) after this flag in a semicolon-separated string. The most commonly used SSL options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in Node.js documentation.

The example below uses the PFX encoded private key and certificate chain to create an HTTPS server.

```sh
testcafe --ssl pfx=path/to/file.pfx;rejectUnauthorized=true;...
```

When you use the programming interface, pass the HTTPS server options to the [createTestCafe](../programming-interface/createtestcafe.md) method.

The following example uses the [openssl-self-signed-certificate](https://www.npmjs.com/package/openssl-self-signed-certificate) module to generate a self-signed certificate:

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