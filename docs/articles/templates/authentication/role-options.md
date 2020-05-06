### options.preserveUrl

Use this option to control which page is opened after you switch to the role.

TestCafe navigates back to the page that was opened before the role was switched.
To save the URL where a browser is redirected after login, set the `preserveUrl` option to `true`.
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