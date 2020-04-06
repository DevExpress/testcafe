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