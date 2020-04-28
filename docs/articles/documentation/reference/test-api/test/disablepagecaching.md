---
layout: docs
title: Test.disablePageCaching Method
permalink: /documentation/reference/test-api/test/disablepagecaching.html
---
# Test.disablePageCaching Method

Disables page caching. Use it if the browser storages are reset after the test navigates to a cached page.  See [Troubleshooting: Test Actions Fail After Authentication](../../../guides/advanced-guides/authentication.md#test-actions-fail-after-authentication) for more information.

```text
test.disablePageCaching
```

**Example**

```js
test
    .disablePageCaching
    ('My test', async t => { /* ... */ });
```

You can also disable page caching during all tests in a fixture with the [fixture.disablePageCaching](../fixture/disablepagecaching.md) method.
