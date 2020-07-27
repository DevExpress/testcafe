---
layout: docs
title: Test HTTPS Features and HTTP/2 Websites
permalink: /documentation/guides/advanced-guides/test-https-features-and-http2-websites.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/test-https-and-http2-websites.html
  - /documentation/using-testcafe/common-concepts/connect-to-the-testcafe-server-over-https.html
---
# Test HTTPS Features and HTTP/2 Websites

This topic describes how TestCafe works with HTTPS and HTTP/2 websites.

* [Test HTTPS Websites](#test-https-websites)
  * [Use a Self-Signed Certificate](#use-a-self-signed-certificate)
  * [Use a Trusted Certificate](#use-a-trusted-certificate)
* [Test HTTP/2 Websites](#test-http2-websites)

## Test HTTPS Websites

TestCafe is a proxy-based testing tool. The TestCafe [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) serves the tested webpage over HTTP and communicates with the original web server over HTTP or HTTPS (depending on the [specified page URL](../../reference/test-api/fixture/page.md)).

![Connection Protocols](../../../images/proxy-connection-protocols.svg)

If the tested page does not use HTTPS-specific features (like
[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API),
[ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), or
[SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)), TestCafe successfully proxies it over HTTP. Otherwise, the tests fail because the page throws JavaScript errors, does not load or loads partially.

### Use a Self-Signed Certificate

To establish a secure HTTPS-connection, Node.js requires a valid [PKCS12](https://en.wikipedia.org/wiki/PKCS_12) certificate (`.pfx`). To launch tests from the command line, you need to [generate one manually](#generate-a-certificate-manually). In API, use an [automatic module](#generate-a-certificate-automatically), unless you are willing to [use a trusted certificate](#use-a-trusted-certificate).

#### Generate a Certificate Manually

In **bash**, a self-signed `.pfx` can be generated using [OpenSSL](https://www.openssl.org/docs/man1.1.1/man1/openssl-req.html):

```sh
openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout openssl.key -out openssl.crt -days 999999
```

You will be prompted for additional information, skip the the questions by pressing Enter. As a result, new `.crt` and `.key` files are generated. Generate a `.pfx` by rinning:

```sh
openssl pkcs12 -export -out path/to/certificate.pfx -inkey openssl.key -in openssl.crt
```

In **PowerShell**, use the [New-SelfSignedCertificate](https://docs.microsoft.com/en-us/powershell/module/pkiclient/new-selfsignedcertificate?view=win10-ps) and [Export-PfxCertificate](https://docs.microsoft.com/en-us/powershell/module/pkiclient/export-pfxcertificate?view=win10-ps) Cmdlets to issue a certificate and export it to `.pfx`:

```sh
$cert = New-SelfSignedCertificate -DnsName mydemowebapp.net -CertStoreLocation cert:\LocalMachine\My
$pwd = ConvertTo-SecureString -String "MyPassword" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath C:\path\to\certificate.pfx -Password $pwd
```

> To use `New-SelfSignedCertificate` and `Export-PfxCertificate`, launch PowerShell in administrative mode.

##### Run Tests

When you run tests from the command line, use the [--ssl](../../reference/command-line-interface.md#--ssl-options) flag to enable HTTPS on a proxy server. Specify options required to initialize [a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) after this flag in a semicolon-separated string. The most commonly used SSL options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in the Node.js documentation.

The example below uses a previously generated `.pfx` file to establish an HTTPS server.

```sh
testcafe chrome --allow-insecure-localhost --hostname localhost test.js --ssl pfx=path/to/certificate.pfx;rejectUnauthorized=true;
```

In this example, `--allow-insecure-localhost` Chrome flag and [`--hostname`](../../reference/command-line-interface.md#--hostname-name) CLI parameter are used together to make Chrome trust the self-signed certificate.

#### Generate a Certificate Automatically

When you use the programming interface, generate a certificate with the [openssl-self-signed-certificate](https://www.npmjs.com/package/openssl-self-signed-certificate) module, and pass the HTTPS server options to the [createTestCafe](../../reference/testcafe-api/global/createtestcafe.md) function.

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

### Use a Trusted Certificate

You can use a certificate signed by a trusted authority to launch tests with TestCafe. We recommend that you prefer a trusted certificate over self-signed if your security policy permits. The browsers are then able to open the tested page without workarounds.

To provide a certificate when you launch TestCafe with [CLI](../../reference/command-line-interface.md), use [`-ssl`](../../reference/command-line-interface.md#--ssl-options) option:

```sh
testcafe chrome  test.js --ssl pfx=path/to/trusted/certificate.pfx;rejectUnauthorized=true;
```

## Test HTTP/2 Websites

TestCafe can test an HTTP/2 website only if the server can downgrade the connection to HTTPS or HTTP/1. See [ALPN negotiation](https://nodejs.org/api/http2.html#http2_alpn_negotiation) for details.
