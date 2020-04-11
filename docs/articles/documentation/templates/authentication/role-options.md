### options.preserveUrl

Use this option to control which page is opened after you switch to the role.

By default, TestCafe navigates back to the page that was opened previously to switching to the role.
Set the `preserveUrl` option to `true` to save the URL to which the browser was redirected after logging in.
Each time you switch to this role, TestCafe navigates to the saved URL.

Use this option to prevent the loss of session-related data stored in the URL (e.g., session ID).

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