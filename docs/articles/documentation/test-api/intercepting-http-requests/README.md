---
layout: docs
title: Intercepting HTTP Requests
permalink: /documentation/test-api/intercepting-http-requests/
checked: true
---
# Intercepting HTTP Requests

This section describes how to handle HTTP requests in your tests. TestCafe allows you to log them and mock the responses out of the box. You can also create a custom HTTP request hook, which allows you, for instance, to emulate authentications like **Kerberos** or **Client Certificate Authentication**.

* [Logging HTTP Requests](logging-http-requests.md)
* [Mocking HTTP Requests](mocking-http-requests.md)
* [Creating a Custom HTTP Request Hook](creating-a-custom-http-request-hook.md)
* [Specifying Which Requests are Handled by the Hook](specifying-which-requests-are-handled-by-the-hook.md)
* [Attaching Hooks to Tests and Fixtures](attaching-hooks-to-tests-and-fixtures.md)

## Logging HTTP Requests

You can use the request logger to record HTTP requests the tested web app sends and responses it receives. For instance, you may want to make sure that the data from a remote service is correct. In this example, the test checks the DevExpress grid control's data.

```js
import { Selector, RequestLogger } from 'testcafe';
import fs from 'fs';
import path from 'path';

const url = 'https://demos.devexpress.com/ASPxGridViewDemos/Exporting/Exporting.aspx';

const logger = RequestLogger({ url, method: 'post' }, {
    logResponseHeaders: true,
    logResponseBody:    true
});

fixture `Export`
    .page(url)
    .requestHooks(logger);

test('export to csv', async t => {
    const exportToCSVButton = Selector('span').withText('Export to CSV');

    await t
        .click(exportToCSVButton)
        .expect(logger.contains(r => r.response.statusCode === 200)).ok();

    // After clicking 'Export', the response comes as a gziped CSV.
    // The browser unpacks the archive and gives you the file that was inside.
    // The test receives the archive as is.
    const filePath = path.join(__dirname, 'exported-grid.zip');

    console.log(filePath);
    console.log(logger.requests[0].response.headers);

    fs.writeFileSync(filePath, logger.requests[0].response.body);

    // Here you can use 3rd party modules to
    // unpack the archive, parse CSV and check the data.
    // Or you can just manually verify the file.
});
```

See [Logging HTTP Requests](logging-http-requests.md) for more information.

## Mocking HTTP Responses

Use TestCafe request mocker to substitute infrastructure that is difficult to deploy or that you do not want to use when testing. This can be a third-party service that charges you per pageview or an analytics service that should not log page views tests generate.

```js
import { Selector, RequestMock } from 'testcafe';

// A URL to which Google Analytics sends data.
const collectDataGoogleAnalyticsRegExp = new RegExp('https://www.google-analytics.com/collect');

// Technically, Google Analytics sends an XHR request for a GIF image.
// So, we prepare a mocked response with binary data.
const mockedResponse = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01]);

const mock = RequestMock()
    .onRequestTo(collectDataGoogleAnalyticsRegExp)

    // We respond to Analytics requests with the prepared data
    // represented as a GIF image and change the status code to 202.
    .respond(mockedResponse, 202, {
        'content-length': mockedResponse.length,
        'content-type': 'image/gif'
    });

fixture `Fixture`
    .page('https://devexpress.github.io/testcafe/')
    .requestHooks(mock);

test('basic', async t => {
    await t
        .click('.get-started-button')

        // During the pause, you can open DevTools and
        // find the request sent to Analytics
        // and the mocked response received.
        .debug();
});
```

See [Mocking HTTP Responses](mocking-http-responses.md) for more information.

## Creating a Custom HTTP Request Hook

You can create your own request hook to handle HTTP requests.

The example below shows a custom hook that adds the `Authorization` header for [JWT](https://tools.ietf.org/html/rfc7519) bearer authorization.

```js
import { Selector, RequestHook } from 'testcafe';

class JwtBearerAuthorization extends RequestHook {
    constructor () {
        // No URL filtering applied to this hook
        // so it will be used for all requests.
        super();
    }

    onRequest (e) {
        e.requestOptions.headers['Authorization'] = 'generate token here';
    }
}

const jwtBearerAuthorization = new JwtBearerAuthorization();

fixture `Fixture`
    .page('<website URL>')
    .requestHooks(jwtBearerAuthorization);

test('basic', async t => {
    /* some actions */
});
```

See [Creating a Custom HTTP Request Hook](creating-a-custom-http-request-hook.md) for more information.
