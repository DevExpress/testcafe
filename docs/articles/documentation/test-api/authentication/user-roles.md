---
layout: docs
title: User Roles
permalink: /documentation/test-api/authentication/user-roles.html
---
# User Roles

Many test scenarios involve the activity of more than one user. TestCafe addresses these scenarios by providing a convenient way
to isolate authentication test actions and apply them easily whenever you need to switch the user account.

A piece of logic that logs in a particular user is called a *role*. Define a role for each user account participating in your test.

## Creating and Using Roles

Use the `Role` constructor to create and initialize a role.

```text
Role( func( t ) )
```

Parameter | Type     | Description
--------- | -------- | --------------------------------------------------------------------------------
`func`    | Function | An asynchronous function that contains logic that authenticates the user.
`t`       | Object   | The [test controller](../test-code-structure.md#test-controller) used to access test run API.

```js
import { Role } from 'testcafe';

const regularAccUser = Role(async t => {
    await t
        .typeText('#login', 'TestUser')
        .typeText('#password', 'testpass')
        .click('#sign-in');
});

const facebookAccUser = Role(async t => {
    await t
        .click('#sign-in-with-facebook')
        .typeText('#email', 'testuser@mycompany.com')
        .typeText('#pass', 'testpass')
        .click('#submit');
});

const admin = Role(async t => {
    await t
        .typeText('#login', 'Admin')
        .typeText('#password', 'adminpass')
        .click('#sign-in');
});
```

> Role initialization code is executed only once when the role is used for the first time.

After you create the roles, you can switch between users at any moment except for the role initialization code.

To switch to a role, use the `t.useRole` function.

```text
t.useRole( role )
```

Parameter | Type   | Description
--------- | ------ | ---------------------------------------------
`role`    | Object | The role you need to use further in the test.

```js
import { Selector } from 'testcafe';

const entry        = Selector('#entry');
const removeButton = Selector('#remove-entry');

fixture `My Fixture`
    .page `http://example.com`;

test('test that involves two users', async t => {
    await t
        .useRole(regularAccUser)
        .expect(entry.exists).ok()
        .expect(removeButton.visible).notOk()
        .useRole(admin)
        .expect(removeButton.visible).ok()
        .click(removeButton)
        .expect(entry.exists).notOk()
});
```

Roles can be shared across tests and fixtures. You can create roles in a separate helper file and use them in any test fixture that references this file.

If a website uses [HTTP Basic](https://en.wikipedia.org/wiki/Basic_access_authentication) or [Windows (NTLM)](https://en.wikipedia.org/wiki/NT_LAN_Manager) authentication, use the approach described in [HTTP Authentication](http-authentication.md).

## Anonymous Role

You can switch back to an unregistered user by using an anonymous role. This role is returned by the static `Role.anonymous()` function.

```js
import { Selector, Role } from 'testcafe';

fixture `My Fixture`;

test('Anonymous users can see newly created comments', async t => {
    await t
        .useRole(registeredUser)
        .navigateTo('http://example.org')
        .typeText('#comment', 'Hey ya!')
        .click('#submit')
        .useRole(Role.anonymous());

        var comment = await Selector('#comment-data');

        await t.expect(comment.innerText).eql('Hey ya!');
});
```