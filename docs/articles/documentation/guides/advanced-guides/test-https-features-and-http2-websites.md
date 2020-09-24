---
layout: docs
title: Test HTTPS Features and HTTP/2 Websites
permalink: /documentation/guides/advanced-guides/test-https-features-and-http2-websites.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/test-https-and-http2-websites.html
  - /documentation/using-testcafe/common-concepts/connect-to-the-testcafe-server-over-https.html
---
# Test HTTPS Features and HTTP/2 Websites

This topic describes how TestCafe executes tests on HTTPS and HTTP/2 websites.

* [Test HTTPS Websites](#test-https-websites)
  * [Use a Trusted Certificate](#use-a-trusted-certificate)
  * [Use a Self-Signed Certificate](#use-a-self-signed-certificate)
* [Test HTTP/2 Websites](#test-http2-websites)

## Test HTTPS Websites

TestCafe is a proxy-based testing tool. The TestCafe [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) serves the tested webpage over HTTP and communicates with the original web server over HTTP or HTTPS (depending on the [specified page URL](../../reference/test-api/fixture/page.md)).

![Connection Protocols](../../../images/proxy-connection-protocols.svg)

If the tested page does not use HTTPS-specific features (like
[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API),
[ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), or
[SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)), TestCafe can proxy it over HTTP. Otherwise, the tests fail because the page throws JavaScript errors, does not load or loads partially.

To establish a secure HTTPS-connection, Node.js requires a valid [PKCS12](https://en.wikipedia.org/wiki/PKCS_12) certificate (`.pfx`). We recommend that you [use a certificate signed by a trusted authority](#use-a-trusted-certificate). This allows a browser to open the tested page without workarounds. You can also [generate and use a self-signed certificate](#use-a-self-signed-certificate).

> Before you use HTTPS, launch testcafe with [`--hostname localhost` CLI parameter](../../reference/command-line-interface.md#--hostname-name) or [`hostname: localhost` configuration option](../../reference/configuration-file.md#hostname). Most modern browsers thread localhost as a secure origin, and some built-in browser features that require a secure origin (Service workers, GeoAPI) should work. Third-party JS features like ApplePaySession may not work depending on implementation.

### Use a Trusted Certificate

To provide a certificate when you launch TestCafe with [CLI](../../reference/command-line-interface.md), use [`-ssl`](../../reference/command-line-interface.md#--ssl-options) option:

```sh
testcafe chrome  test.js --ssl pfx=path/to/trusted/certificate.pfx;rejectUnauthorized=true;
```

### Use a Self-Signed Certificate

[Generate a self-signed certificate with `openssl`](#generate-a-certificate-from-the-command-line) if you launch tests from the command line. To [generate a certificate in code](#generate-a-certificate-in-your-code), use the `openssl-self-signed-certificate` module.

#### Generate a Certificate From the Command Line

In **bash**, you can use [OpenSSL](https://www.openssl.org/docs/man1.1.1/man1/openssl-req.html) to generate a certificate chain.

1. Issue your own CA certificate and a CA-signed certificate for the web server:

    ```sh
    openssl genrsa -des3 -out myCA.key 2048
    ```

    You will be prompted for a non-empty passphrase. Take note of it.  
2. Generate a root certificate:

    ```sh
    openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem
    ```

    You will be prompted for additional information, press Enter to skip the questions.
3. Create a CA-signed domain certificate and a `.csr` sign request:

    ```sh
    openssl genrsa -out testingdomain.key 2048
    openssl req -new -key testingdomain.key -out testingdomain.csr
    ```

    You can press Enter to skip the questions, but set a recognizable CN (Common Name) so that you can easily find this certificate in a list of others later.  
4. Create a config file `testdomain.ext` with the following content:
  
    ```sh
    authorityKeyIdentifier=keyid,issuer
    basicConstraints=CA:FALSE
    keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
    subjectAltName = @alt_names

    [alt_names]
    DNS.1 = localhost
    ```

5. Now create the certificate from the `.csr` request, the CA private key (`myCA.key`), the CA certificate (`myCA.pem`), and a config file(`testdomain.ext`):

    ```sh
    openssl x509 -req -in testingdomain.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial -out testingdomain.crt -days 825 -sha256 -extfile testdomain.ext
    ```

6. Finally, export the certificate to PKCS#12 `.pfx` format:

    ```sh
    openssl pkcs12 -export -out testingdomain.pfx -inkey testingdomain.key -in testingdomain.crt -certfile myCA.pem
    ```

In **PowerShell**, [install OpenSSL](https://adamtheautomator.com/install-openssl-powershell/#Installing_OpenSSL_with_PowerShell_and_Chocolatey) and [update environment variables](https://adamtheautomator.com/install-openssl-powershell/#Update_PowerShell_Profile_Environment_Variables). Afterwards, proceed with the instructions [above](#generate-a-certificate-from-the-command-line).

##### Run Tests

When you run tests from the command line, use [--ssl](../../reference/command-line-interface.md#--ssl-options) flag to enable HTTPS on a proxy server. Specify options required to initialize [a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) after this flag in a semicolon-separated string. The most commonly used SSL options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in the Node.js documentation.

The examples below use a previously generated `.pfx` file to establish an HTTPS server.

In ***Chrome*** and ***Chromium-Based*** Browsers, use the `--allow-insecure-localhost` flag and [`--hostname`](../../reference/command-line-interface.md#--hostname-name) CLI parameter to make Chrome trust the certificate when tests are run on localhost. If you use a different URL, use the `--ignore-certificate-errors` flag.

```sh
testcafe chrome --allow-insecure-localhost --hostname localhost test.js --ssl pfx=path/to/certificate.pfx;rejectUnauthorized=true;
```

In ***Firefox***, add your self-signed root authority to the trusted list. Follow the steps:

1. [Create a new profile](https://support.mozilla.org/en-US/kb/profile-manager-create-remove-switch-firefox-profiles#w_creating-a-profile) in Firefox settings;
2. [Run Firefox with this profile](https://support.mozilla.org/en-US/kb/profile-manager-create-remove-switch-firefox-profiles#w_manage-profiles-when-firefox-is-open) and [import the CA certificate](https://support.mozilla.org/en-US/questions/1059377) (`myCA.pem`) you generated previously. Ensure the **This certificate can identify websites** checkbox is checked;
3. Load this new profile when TestCafe launches Firefox. To do this, add `-P <profile_name>` to the browser's command line arguments.

```sh
testcafe 'firefox -P testing-profile' --hostname localhost assertTest.js --ssl pfx=certificate.pfx;rejectUnauthorized=true;
```

> The certificate created in the example is valid only for localhost domain. This is why the `--hostname` option is used. If you want to use another domain for testing, enter it in the `[alt_names]` section of `testdomain.ext` configuration file before creating the certificate.  

<!---->

> Important! For security reasons, only use this profile for testing purposes.

#### Generate a Certificate in Your Code

When you use the programming interface, generate a certificate with the [openssl-self-signed-certificate](https://www.npmjs.com/package/openssl-self-signed-certificate) module and pass the HTTPS server options to the [createTestCafe](../../reference/testcafe-api/global/createtestcafe.md) function.

```js
const createTestCafe        = require('testcafe');
const selfSignedSertificate = require('openssl-self-signed-certificate');

const sslOptions = {
    key:  selfSignedSertificate.key,
    cert: selfSignedSertificate.cert
};

const testcafe = await createTestCafe('localhost', 1337, 1338, sslOptions);
const runner   = testcafe.createRunner();

await runner
    .src('test.js')

    // Browsers restrict self-signed certificate usage unless you
    // explicitly set a flag specific to each browser.
    // For Chrome, this is '--allow-insecure-localhost'.
    .browsers('chrome --allow-insecure-localhost')
    .run();
```

## Test HTTP/2 Websites

TestCafe can test an HTTP/2 website only if the server can downgrade the connection to HTTPS or HTTP/1. See [ALPN negotiation](https://nodejs.org/api/http2.html#http2_alpn_negotiation) for details.
