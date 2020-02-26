---
layout: docs
title: Fixture.disablePageCaching Method
permalink: /documentation/reference/test-api/fixture/disablepagecaching.html
---
# Fixture.disablePageCaching Method

Disables page caching to keep content in the browser storages after navigation to a cached page. See [Troubleshooting: Test Actions Fail After Authentication](../../../guides/advanced-guides/authentication.md#fixture-hooks#test-actions-fail-after-authentication) for more information.

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
