---
layout: docs
title: t.setTestSpeed Method
permalink: /documentation/reference/test-api/testcontroller/settestspeed.html
---
# t.setTestSpeed Method

Specifies the test execution speed.

```text
t.setTestSpeed( factor )
```

Parameter  | Type      | Description
---------- | --------- | -----------
`factor`   | Number    | Specifies the test speed. Must be a number between `1` (the fastest) and `0.01` (the slowest).

Tests are run at the maximum speed by default.

If the speed is also specified for an individual action, the action's speed setting overrides the test speed.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Test Speed`
    .page `http://devexpress.github.io/testcafe/example/`;

const nameInput = Selector('#developer-name');

test(`Test Speed`, async t => {
    await t
        .typeText(nameInput, 'Peter')
        .setTestSpeed(0.1)
        .typeText(nameInput, ' Parker');
});
```
