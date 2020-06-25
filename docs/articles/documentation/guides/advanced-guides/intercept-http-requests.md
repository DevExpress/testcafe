---
layout: docs
title: Intercept HTTP Requests
permalink: /documentation/guides/advanced-guides/intercept-http-requests.html
redirect_from:
  - /documentation/test-api/intercepting-http-requests/mocking-http-responses.html
  - /documentation/test-api/intercepting-http-requests/
  - /documentation/test-api/intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.html
  - /documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.html
  - /documentation/test-api/intercepting-http-requests/logging-http-requests.html
  - /documentation/test-api/intercepting-http-requests/mocking-http-requests.html
  - /documentation/test-api/intercepting-http-requests/requestoptions-object.html
  - /documentation/test-api/intercepting-http-requests/select-requests-to-be-handled-by-the-hook.html
  - /documentation/test-api/intercepting-http-requests/specifying-which-requests-are-handled-by-the-hook.html
---
# Intercept HTTP Requests

This section describes how to handle HTTP requests in your tests. TestCafe ships with request hooks that allow you to log the requests and mock the responses. You can also create a custom HTTP request hook, which enables you, for instance, to emulate authentications like **Kerberos** or **Client Certificate Authentication**.

* [Log HTTP Requests](#log-http-requests)
* [Mock HTTP Requests](#mock-http-requests)
* [Create a Custom Request Hook](#create-a-custom-request-hook)
* [Attach Hooks to Tests and Fixtures](#attach-hooks-to-tests-and-fixtures)

## Log HTTP Requests

You can use the [request logger](../../reference/test-api/requestlogger/README.md) to record HTTP requests the tested web app sends and responses it receives. For instance, you may want to make sure that the data from a remote service is correct.

Use the [RequestLogger](../../reference/test-api/requestlogger/constructor.md) constructor to create a request logger.

```js
import { RequestLogger } from 'testcafe';

const simpleLogger = RequestLogger('http://example.com');
const headerLogger = RequestLogger(/testcafe/, {
    logRequestHeaders: true,
    logResponseHeaders: true
});
```

To enable the logger to track requests, [attach the logger to a test or fixture](#attach-hooks-to-tests-and-fixtures).

The `RequestLogger` stores the following parameters by default:

* The URL where the request is sent.
* The request's HTTP method.
* The status code received in the response.
* The user agent that sent the request.

Use the logger's API to access the data it stores.

Member | Description
------ | -------------
[contains](../../reference/test-api/requestlogger/contains.md) | Returns whether the logger contains a request that matches the predicate.
[count](../../reference/test-api/requestlogger/count.md)       | Returns the number of requests that match the predicate.
[clear](../../reference/test-api/requestlogger/clear.md)       | Clears all logged requests.
[requests](../../reference/test-api/requestlogger/requests.md) | Returns an array of logged requests.

**Example**

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
    // Or you can just verify the file manually.
});
```

## Mock HTTP Requests

Use TestCafe [request mocker](../../reference/test-api/requestmock/README.md) to substitute infrastructure that is difficult to deploy or that you do not want to use for test purposes. This can be a third-party service that charges you per pageview or an analytics service that should not log page views that tests generate. The mocker can intercept requests to this resource and emulate the response as needed.

Use the [RequestMock](../../reference/test-api/requestmock/constructor.md) constructor to create a request mocker.

```js
var mock = RequestMock();
```

Then call the [onRequestTo](../../reference/test-api/requestmock/onrequestto.md) and [respond](../../reference/test-api/requestmock/respond.md) methods in a chained fashion. The [onRequestTo](../../reference/test-api/requestmock/onrequestto.md) method specifies a request to intercept, while the [respond](../../reference/test-api/requestmock/respond.md) method specifies the mocked response for this request. Call these methods repeatedly to provide a mock for every request you need.

```js
var mock = RequestMock()
    .onRequestTo(request1)
    .respond(responseMock1)
    .onRequestTo(request2)
    .respond(responseMock2);
```

Next, [attach it to a test or fixture](#attach-hooks-to-tests-and-fixtures).

**Example**

```js
import { Selector, RequestMock } from 'testcafe';

// A URL to which Google Analytics sends data.
const collectDataGoogleAnalyticsRegExp = new RegExp('https://www.google-analytics.com/collect');

// Technically, Google Analytics sends an XHR request for a GIF image.
// So, the mocked response should contain binary data.
const mockedResponse = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01]);

const mock = RequestMock()
    .onRequestTo(collectDataGoogleAnalyticsRegExp)

    // The hook responds to Analytics requests with the prepared data
    // represented as a GIF image and changes the status code to 202.
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

## Create a Custom Request Hook

You can create your own request hook to handle HTTP requests. This topic describes request hooks and how to create a custom hook.

Do the following to write a custom hook:

* inherit from the [RequestHook](../../reference/test-api/requesthook/README.md) class,
* override the [onRequest](../../reference/test-api/requesthook/onrequest.md) method to handle the request before it is sent,
* override the [onResponse](../../reference/test-api/requesthook/onresponse.md) method to handle the response after it is received.

```js
import { RequestHook } from 'testcafe';

export class MyRequestHook extends RequestHook {
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

In test code, create a hook instance and [attach it to a test or fixture](#attach-hooks-to-tests-and-fixtures).

```js
import { MyRequestHook } from './my-request-hook';

const customHook = new MyRequestHook(/https?:\/\/example.com/);

fixture `My fixture`
    .page('http://example.com')
    .requestHooks(customHook);

test('My test', async t => {
        // test actions
});
```

**Example**

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

    onResponse (e) {
        // This method must also be overridden,
        // but you can leave it blank.
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

## Attach Hooks to Tests and Fixtures

To attach a hook to a test or fixture, use the [fixture.requestHooks](../../reference/test-api/fixture/requesthooks.md) and [test.requestHooks](../../reference/test-api/test/requesthooks.md) methods. A hook attached to a fixture handles requests from all tests in the fixture.

> Hooks attached to a fixture are invoked before the hooks attached to individual tests.

You can use the [t.addRequestHooks](../../reference/test-api/testcontroller/addrequesthooks.md) and [t.removeRequestHooks](../../reference/test-api/testcontroller/removerequesthooks.md) methods to attach and detach hooks during the test.

```js
import { RequestLogger, RequestMock } from 'testcafe';

const logger = RequestLogger('http://example.com');
const mock   = RequestMock()
    .onRequestTo('http://external-service.com/api/')
    .respond({ data: 'value' });

fixture `My fixture`
    .page('http://example.com')
    .requestHooks(logger);

test
    .requestHooks(mock)
    ('My test', async t => {
    await t
         .click('#send-logged-request')
         .expect(logger.count(() => true)).eql(1)
         .removeRequestHooks(logger)
         .click('#send-unlogged-request')
         .expect(logger.count(() => true)).eql(1)
         .addRequestHooks(logger)
         .click('#send-logged-request')
         .expect(logger.count(() => true)).eql(2);
});
```
