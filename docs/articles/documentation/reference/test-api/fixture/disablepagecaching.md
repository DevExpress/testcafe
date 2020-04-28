---
layout: docs
title: Fixture.disablePageCaching Method
permalink: /documentation/reference/test-api/fixture/disablepagecaching.html
---
# Fixture.disablePageCaching Method

Disables page caching. Use it if the browser storages are reset after the test navigates to a cached page. See [Troubleshooting: Test Actions Fail After Authentication](../../../guides/advanced-guides/authentication.md#test-actions-fail-after-authentication) for more information.

```text
fixture.disablePageCaching
```

**Example**

```js
fixture
    .disablePageCaching `My fixture`
    .page `https://example.com`;
```

You can also disable page caching during a particular test with the [test.disablePageCaching](../test/disablepagecaching.md) method.
