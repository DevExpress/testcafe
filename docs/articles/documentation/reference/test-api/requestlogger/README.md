---
layout: docs
title: RequestLogger Class
permalink: /documentation/reference/test-api/requestlogger/
---
# RequestLogger Class

A request logger that stores the requests sent and responses received during test execution.

Use the [RequestLogger](../requestlogger/constructor.md) constructor to create a logger.

[Attach the logger to a test or fixture](../../../guides/advanced-guides/intercept-http-requests.md#attach-hooks-to-tests-and-fixtures) to enable logging.

You can access the log with the [logger.requests](requests.md) property, or search for entries that satisfy a predicate with [logger.contains](contains.md) and [logger.count](count.md) methods.

The [logger.clear](clear.md) method removes all entries from the log.

```js
import { RequestLogger } from 'testcafe';

const logger = RequestLogger();

fixture `My fixture`
    .page `http://example.com`
    .requestHooks(logger);

test('My test', async t => {
    await t
        .expect(logger.contains(record => record.response.statusCode === 200)).ok()
        .expect(logger.requests[0].method).eql('get');
});
```
