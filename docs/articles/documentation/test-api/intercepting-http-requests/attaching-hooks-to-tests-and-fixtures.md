---
layout: docs
title: Attaching Hooks to Tests and Fixtures
permalink: /documentation/test-api/intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.html
checked: true
---
# Attaching Hooks to Tests and Fixtures

To attach a hook to a test or fixture, use the `fixture.requestHooks` and `test.requestHooks` methods. A hook attached to a fixture handles requests from all tests in the fixture.

```text
fixture.requestHooks(...hooks)
test.requestHooks(...hooks)
```

You can also attach and detach hooks during test run using the `t.addRequestHooks` and `t.removeRequestHooks` methods.

```text
t.addRequestHooks(...hooks)
t.removeRequestHooks(...hooks)
```

Parameter | Type | Description
--------- | ---- | ------------
`hooks`    | RequestHook subclass | A `RequestLogger`, `RequestMock` or custom user-defined hook.

The `fixture.requestHooks`, `test.requestHooks`, `t.addRequestHooks` and `t.removeRequestHooks` methods use the rest operator which allows you to pass multiple hooks as parameters or arrays of hooks.

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
})
```
