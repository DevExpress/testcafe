---
layout: docs
title: Attaching Hooks to Tests and Fixtures
permalink: /documentation/test-api/intercepting-and-mocking-http-requests/attaching-hooks-to-tests-and-fixtures.html
checked: false
---
# Attaching Hooks to Tests and Fixtures

To attach a hook to a test or fixture, use the `fixture.requestHooks` and `test.requestHooks` methods. A hook attached to a fixture will handle requests from all tests in the fixture.

```text
fixture.requestHooks(...hook)
test.requestHooks(...hook)
```

Parameter | Type | Description
--------- | ---- | ------------
`hook`    | RequestHook | A request logger, mock or custom hook.

The `requestHooks` methods use the rest operator, which allows you to pass multiple hooks as parameters or arrays of hooks.

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
        // test actions
    })
```

You can also attach and detach hooks during test run. To do this, use the `t.addRequestHooks` and `t.removeRequestHooks` methods.

```text
t.addRequestHooks(...hook)
t.removeRequestHooks(...hooks)
```

Parameter | Type | Description
--------- | ---- | ------------
`hook`    | RequestHook | A request logger, mock or custom hook.

The `t.addRequestHooks` and `t.removeRequestHooks` methods use the rest operator, which allows you to pass multiple hooks as parameters or arrays of hooks.

```js
import { RequestLogger } from 'testcafe';

const logger = RequestLogger('http://example.com');

fixture `My fixture`
    .page('http://example.com');

test('My test', async t => {
    await t
        .click('#send-unlogged-request')
        .addRequestHooks(logger)
        .click('#send-logged-request')
        .expect(logger.count(() => true)).eql(1)
        .removeRequestHooks(logger)
        .click('#send-unlogged-request');
})
```
