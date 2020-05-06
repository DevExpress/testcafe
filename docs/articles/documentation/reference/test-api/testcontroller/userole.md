---
layout: docs
title: TestController.useRole Method
permalink: /documentation/reference/test-api/testcontroller/userole.html
---
# TestController.useRole Method

Activates the role.

```text
t.useRole( role )
```

Parameter | Type   | Description
--------- | ------ | ---------------------------------------------
`role`    | Object | The role to use in the test.

```js
import { Role, Selector } from 'testcafe';

const registeredUser = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'username')
        .typeText('#password', 'pa$$w0rd')
        .click('#sign-in');
});

fixture `My Fixture`
    .page `http://example.com`;

test('My Test', async t => {
    await t
        .useRole(registeredUser)
        .expect(Selector('#avatar').visible).ok();
```

Switch to [Role.anonymous()](../role/anonymous.md) to log out:

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
