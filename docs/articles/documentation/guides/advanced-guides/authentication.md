---
layout: docs
title: Authentication
permalink: /documentation/guides/advanced-guides/authentication.html
---
# Authentication

TestCafe ships with the [user roles](#user-roles) mechanism that covers most authentication types that require user actions on the page.

You can also test websites that use [HTTP Basic](https://en.wikipedia.org/wiki/Basic_access_authentication) and [NTLM](https://en.wikipedia.org/wiki/NT_LAN_Manager) authentication. See [HTTP/NTLM Authentication](#http-authentication) for more information on how to provide the credentials.

## User Roles

Many test scenarios involve the activity of more than one user. TestCafe addresses these scenarios by providing a convenient way
to isolate authentication test actions and apply them easily whenever you need to switch the user account.

A piece of logic that logs in a particular user is called a *role*. Define a role for each user account participating in your test.

### Why Use Roles

Unlike other methods used to [extract reusable test logic](../../recipes/extract-reusable-test-code/README.md), roles were specially designed for login operations and provide the following dedicated features:

* **Object-based API.** Authentication data and logic are stored in an object that is easy to pass around and activate when needed.
* **Single login.** Login actions are not repeated when you switch to a previously used role within the same session. If you activate a role in the [beforeEach](../basic-guides/test-organization.md#test-hooks) hook, login actions run once before the first test. The subsequent tests reuse authentication data so that it happens instantly.
* **Automatic return.** The browser automatically navigates back to the page that was opened when you switched the role (you can disable this behavior if it doesn't suit your scenario).
* **No logout needed.** Authentication data is automatically cleared when you switch between roles.
* **Multiple authentication support.** If you log in to different services/websites during a test, authentication data from cookies and browser storages is accumulated in the active role. When you switch back to this role within the same test, you are automatically logged in to all the websites.
* **Anonymous role.** A built-in role that quilckly logs you out of all the accounts.

> Roles work with authentication data in cookies and browser storages. If your authentication system stores data elsewhere, you may not be able to use roles.

### Create and Apply Roles

Use the [Role](../../reference/test-api/role/costructor.md) constructor to create and initialize a role. Pass the login page URL and sign-in [actions](../basic-guides/interact-with-the-page.md) to `Role`.

```js
import { Role } from 'testcafe';

const regularAccUser = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'TestUser')
        .typeText('#password', 'testpass')
        .click('#sign-in');
});

const facebookAccUser = Role('http://example.com/login', async t => {
    await t
        .click('#sign-in-with-facebook')
        .typeText('#email', 'testuser@mycompany.com')
        .typeText('#pass', 'testpass')
        .click('#submit');
});

const admin = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'Admin')
        .typeText('#password', 'adminpass')
        .click('#sign-in');
});
```

> Role initialization code is executed only once when the role is used for the first time.

After you create the roles, you can switch between users at any moment except for the role initialization code.

If you switch to a role for the first time in test run, the browser will be navigated from the original page to a login page where the role initialization code will be executed. Then the original page will be reloaded with new credentials (you can use the [preserveUrl](../../reference/test-api/role/constructor.md#optionspreserveurl) option to disable redirect to the original page). If you switch to a role that has already been initialized, TestCafe simply reloads the current page with the appropriate credentials.

To switch to a role, use the [t.useRole](../../reference/test-api/testcontroller/userole.md) function.

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
        .expect(entry.exists).notOk();
});
```

Roles can be shared across tests and fixtures. You can create roles in a separate helper file and use them in any test fixture that references this file.

When you switch to a role for the first time, TestCafe internally creates a *branch* of this role for this particular test run. All cookies set by your further actions will be appended to this branch. This branch will be used whenever you switch back to this role from the same test run.

For instance, assume that you switch to a role that logs you in on **website A**. After you switch to this role, you log in to **website B** in test code. TestCafe adds the new cookie to the role branch. If you switch to a different role and then back to the initial role in the same test run, you will be logged to **both website A and B**. If you switch to this role in a different test, you will be logged in to **website A** only.

### Anonymous Role

You can switch back to an unregistered user by using an anonymous role. This role is returned by the static [Role.anonymous()](../../reference/test-api/role/anonymous.md) function.

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

    const comment = await Selector('#comment-data');

    await t.expect(comment.innerText).eql('Hey ya!');
});
```

## HTTP Authentication

TestCafe allows you to test web pages that are protected with HTTP [Basic](https://en.wikipedia.org/wiki/Basic_access_authentication) or [Windows (NTLM)](https://en.wikipedia.org/wiki/Integrated_Windows_Authentication) authentication. Use the [test.httpAuth](../../reference/test-api/test/httpauth.md) method to specify the credentials to be used by an individual test and the [fixture.httpAuth](../../reference/test-api/fixture/httpauth.md) method to specify the credentials for the entire fixture.

```js
fixture `My fixture`
    .page `http://example.com`
    .httpAuth({
        username: 'username',
        password: 'Pa$$word',

        // Optional parameters, can be required for the NTLM authentication.
        domain:      'CORP-DOMAIN',
        workstation: 'machine-win10'
    });

test('Test1', async t => {});          // Logs in as username

test                                   // Logs in as differentUserName
    .httpAuth({
        username: 'differentUserName',
        password: 'differentPa$$word'
    })
    ('Test2', async t => {});
```

## Troubleshooting

### Test Actions Fail After Authentication

This issue can be caused by the browser's page caching.

In order to guarantee seamless test execution, browsers that run TestCafe tests should always fetch the tested page from the TestCafe proxy server. This ensures that automation scripts on the page are in sync with the server side.

However, if the browser uses a cached copy of the page, automation mechanisms may be interrupted. Among other issues, this could reset authentication data in the cookies, local and session storage during navigation.

If tests fail unexpectedly after authentication, try the following:

* Enable the [preserveUrl](../../reference/test-api/role/constructor.md#optionspreserveurl) option to avoid automatic navigation.
* If `preserveUrl` does not fix the issue, disable page caching. Note that this slows down test execution.

Use the [fixture.disablePageCaching](../../reference/test-api/fixture/disablepagecaching.md) and [test.disablePageCaching](../../reference/test-api/test/disablepagecaching.md) methods to disable caching during a fixture or test:

```js
fixture
    .disablePageCaching `My fixture`
    .page `https://example.com`;
```

```js
test
    .disablePageCaching
    ('My test', async t => { /* ... */ });
```

To disable page caching during the entire test run, use either of the following options:

* the [--disable-page-caching](../../reference/command-line-interface.md#--disable-page-caching) command line flag,
* the `disablePageCaching` option in the [runner.run](../../reference/api/runner/run.md) method,
* the [disablePageCaching](../../reference/configuration-file.md#disablepagecaching) configuration file property.