---
layout: docs
title: createTestCafe Function
permalink: /documentation/reference/testcafe-api/global/createtestcafe.html
redirect_from:
  - /documentation/using-testcafe/programming-interface/createtestcafe.html
---
# createTestCafe Function

Creates a [TestCafe](../testcafe/README.md) server instance.

```text
async createTestCafe([hostname], [port1], [port2], [sslOptions], [developmentMode]) → Promise<TestCafe>
```

Parameter                     | Type   | Description                                                                                                                                                                                                  | Default
----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------
`hostname`&#160;*(optional)*       | String | The hostname or IP on which the TestCafe server runs. Must resolve to the current machine. To test on external devices, use the hostname that is visible in the network shared with these devices. | Hostname of the OS. If the hostname does not resolve to the current machine - its network IP address.
`port1`, `port2`&#160;*(optional)* | Number | Ports that will be used to serve tested webpages.                                                                                                                                                            | Free ports selected automatically.
`sslOptions`&#160;*(optional)*     | Object | Options that allow you to establish an HTTPS connection between the TestCafe server and the client browser. This object should contain options required to initialize [a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener). The most commonly used SSL options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in the Node.js documentation. See [Test HTTPS and HTTP/2 Websites](../../../guides/advanced-guides/test-https-features-and-http2-websites.md) for more information.
`developmentMode`&#160;*(optional)* | Boolean | Enables/disables mechanisms to log and diagnose errors. You should enable this option before you contact TestCafe Support to report an issue. | `false`

*Related configuration file properties*:

* [hostname](../../configuration-file.md#hostname)
* [port1, port2](../../configuration-file.md#port1-port2)
* [ssl](../../configuration-file.md#ssl)
* [developmentMode](../../configuration-file.md#developmentmode)

**Example**

Create a `TestCafe` instance with the `createTestCafe` function.

```js
const createTestCafe = require('testcafe');

createTestCafe('localhost', 1337, 1338)
    .then(testcafe => {
        runner = testcafe.createRunner();
        /* ... */
    });
```

Establish an HTTPS connection with the TestCafe server. The [openssl-self-signed-certificate](https://www.npmjs.com/package/openssl-self-signed-certificate) module is used to generate a self-signed certificate for development use.

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

## See Also

* [TestCafe Class](../testcafe/README.md)
