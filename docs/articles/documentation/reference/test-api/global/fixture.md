---
layout: docs
title: fixture Function
permalink: /documentation/reference/test-api/global/fixture.html
---
# fixture Function

Declares a fixture.

```text
fixture( fixtureName )
fixture `fixtureName`
```

Parameter     | Type   | Description
------------- | ------ | ------------------------
`fixtureName` | String | The name of the fixture.

This function returns the fixture object that allows you to configure the fixture: specify the [start webpage](../../../guides/basic-guides/organize-tests.md#specify-the-start-webpage), [metadata](../../../guides/basic-guides/organize-tests.md#specify-test-metadata) and [the initialization and clean-up code](../../../guides/basic-guides/organize-tests.md#initialization-and-clean-up) for tests included in the fixture.

```js
fixture `Authentication tests`
    .page `https://devexpress.github.io/testcafe/`
    .beforeEach(async t => {
        await t.click('#button');
    });
```

Use the [test](test.md) global function to declare tests in this fixture.
