---
layout: docs
title: Role.anonymous Static Method
permalink: /documentation/reference/test-api/role/anonymous.html
---
# Role.anonymous Static Method

Returns an anonymous role that logs out the user when activated.

```text
Role.anonymous()
```

Call the [t.useRole](../testcontroller/userole.md) method to activate an anonymous role:

```js
import { Role, Selector } from 'testcafe';

const payingUser = Role('http://example.com/login', async t => {
    // Log in...
});

fixture `My Fixture`
    .page `http://example.com/`;

test('Paid content is displayed for paying users', async t => {
    await t
        .useRole(payingUser)
        .expect(Selector('#paid-content').visible).ok()
        .useRole(Role.anonymous())
        .expect(Selector('#paid-content').visible).notOk();
});
```
