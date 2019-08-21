---
layout: docs
title: User Roles
permalink: /documentation/test-api/authentication/user-roles.html
---
# User Roles

Many test scenarios involve the activity of more than one user. TestCafe addresses these scenarios by providing a convenient way
to isolate authentication test actions and apply them easily whenever you need to switch the user account.

A piece of logic that logs in a particular user is called a *role*. Define a role for each user account participating in your test.

* [Why Use Roles](#why-roles)
* [Create and Apply Roles](#create-and-apply-roles)
* [Anonymous Role](#anonymous-role)
* [Role Options](#role-options)
  * [options.preserveUrl](#optionspreserveurl)
* [Troubleshooting](#troubleshooting)
  * [Test Actions Fail After Authentication](#test-actions-fail-after-authentication)

## Why Use Roles

Roles are more than just another way to [extract reusable test logic](../../recipes/extract-reusable-test-code/README.md). They were specially designed for login operations and provide the following dedicated features:

* **Object-based API.** Authentication data and logic are stored in an object that is easy to pass around and activate when needed.
* **Single login.** Login actions are not repeated when you switch to a previously used role within the same session. If you activate a role in the [beforeEach](../test-code-structure.md#test-hooks) hook, login actions run once before the first test. The subsequent tests reuse authentication data so that it happens instantly.
* **Automatic return.** The browser automatically navigates back to the page that was opened when you switched the role (you can disable this behavior if it doesn't suit your scenario).
* **No logout needed.** Authentication data is automatically cleared when you switch between roles.
* **Multiple authentication support.** If you log in to different services/websites during a test, authentication data from cookies and browser storages is accumulated in the active role. When you switch back to this role within the same test, you are automatically logged in to all the websites.
* **Anonymous role.** A built-in role that quilckly logs you out of all the accounts.

> Roles work with authentication data in cookies and browser storages. If your authentication system stores data elsewhere, you may not be able to use roles.

## Create and Apply Roles

Use the `Role` constructor to create and initialize a role.

```text
Role( url, func( t ) [, options] )
```

Parameter | Type     | Description
--------- | -------- | --------------------------------------------------------------------------------
`url`     | String   | The URL of the login page.
`func`    | Function | An asynchronous function that contains logic that authenticates the user.
`t`       | Object   | The [test controller](../test-code-structure.md#test-controller) used to access test run API.
`options` | Object   | See [Role Options](#role-options).

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

If you switch to a role for the first time in test run, the browser will be navigated from the original page to a login page where the role initialization code will be executed. Then the original page will be reloaded with new credentials (you can use the [preserveUrl](#optionspreserveurl) option to disable redirect to the original page). If you switch to a role that has already been initialized, TestCafe simply reloads the current page with the appropriate credentials.

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

When you switch to a role for the first time, TestCafe internally creates a *branch* of this role for this particular test run. All cookies set by your further actions will be appended to this branch. This branch will be used whenever you switch back to this role from the same test run.

For instance, assume that you switch to a role that logs you in on **website A**. After you switch to this role, you log in to **website B** in test code. TestCafe adds the new cookie to the role branch. If you switch to a different role and then back to the initial role in the same test run, you will be logged to **both website A and B**. If you switch to this role in a different test, you will be logged in to **website A** only.

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

## Role Options

You can pass the following options to the [Role constructor](#create-and-apply-roles).

### options.preserveUrl

Use this option to control which page is opened after you switch to the role.

By default, TestCafe navigates back to the page that was opened previously to switching to the role.
Set the `preserveUrl` option to `true` to save the URL to which the browser was redirected after logging in.
TestCafe will navigate to the saved URL each time after you switch to this role.

This option is useful if you store session-related data (like session ID) in the URL.

```js
import { Role } from 'testcafe';

const role = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'username')
        .typeText('#password', 'password')
        .click('#sign-in'); // Redirects to http://example.com?sessionId=abcdef
}, { preserveUrl: true });

fixture `My Fixture`;

test('My test', async t => {
    await t
        .navigateTo('http://example.com/')

        // Does not return to http://example.com/ but
        // stays at http://example.com?sessionId=abcdef instead
        // because options.preserveUrl is enabled.
        .useRole(role);
```

**Default value**: `false`

## Troubleshooting

### Test Actions Fail After Authentication

This issue can be caused by the browser's page caching.

In order to guarantee seamless test execution, browsers that run TestCafe tests should always fetch the tested page from the TestCafe proxy server. This ensures that automation scripts on the page are in sync with the server side.

However, if the browser uses a cached copy of the page, automation mechanisms may be interrupted. Among other issues, this could reset authentication data in the cookies, local and session storages during navigation.

If tests fail unexpectedly after authentication, try the following steps:

* Enable the [preserveUrl](#optionspreserveurl) option to avoid automatic navigation.
* If `preserveUrl` does not fix the issue, disable page caching. Note that this slows down test execution.

Use the [fixture.disablePageCaching](../test-code-structure.md#disable-page-caching) and [test.disablePageCaching](../test-code-structure.md#disable-page-caching) methods to disable caching during a particular fixture or test.

To disable page caching during the entire test run, use either of the following options:

* the [--disable-page-caching](../../using-testcafe/command-line-interface.md#--disable-page-caching) command line flag
* the `disablePageCaching` option in the [runner.run](../../using-testcafe/programming-interface/runner.md#run) method
* the [disablePageCaching](../../using-testcafe/configuration-file.md#disablepagecaching) configuration file property
