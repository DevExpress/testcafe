---
layout: docs
title: Connect to TestCafe Server over HTTPS
permalink: /documentation/using-testcafe/common-concepts/connect-to-testcafe-server-over-https.html
---
# Connect to TestCafe Server over HTTPS

TestCafe is a proxy-based testing tool. Browser requests are sent via the TestCafe proxy server to the tested website. All requests between the browser and TestCafe server are sent over the HTTP protocol.

![Connection Protocols](../../../images/proxy-connection-protocols.svg)

Some browser features (like
[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API),
[ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), or
[SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto))
require secure origin. This means that the website should be served over the HTTPS protocol. If you run tests against pages with this kind of browser API in a regular way, they will fail with JavaScript errors.

TestCafe allows you to connect to the proxy server over the HTTPS protocol to support secure origin testing.

Use the [--ssl](../command-line-interface.md#--ssl-options) flag when you run tests from the command line. Specify options required to initialize
[a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) after this flag in a semicolon-separated string.

The example below uses the PFX encoded private key and certificate chain to create an HTTPS server.

```sh
testcafe --ssl pfx=path/to/file.pfx;rejectUnauthorized=true;...
```

When you use the programming interface, pass HTTPS server options to the [createTestCafe](../programming-interface/createtestcafe.md) method.

The following example uses the [openssl-self-signed-certificate](https://www.npmjs.com/package/openssl-self-signed-certificate) module to generate a self-signed certificate for development use.

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
        /* ... */
    })
```