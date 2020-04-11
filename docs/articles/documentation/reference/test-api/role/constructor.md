---
layout: docs
title: Role Constructor
permalink: /documentation/reference/test-api/role/constructor.html
---
# Role Constructor

Creates and initializes a [user role](../../../guides/advanced-guides/authentication.md#user-roles).

```text
Role( url, func( t ) [, options] )
```

Parameter | Type     | Description
--------- | -------- | --------------------------------------------------------------------------------
`url`     | String   | The URL of the login page.
`func`    | Function | An asynchronous function that authenticates the user.
`t`       | Object   | The [test controller](../testcontroller/README.md) used to access test run API.
`options` | Object   | See [Options](#options).

```js
import { Role } from 'testcafe';

const registeredUser = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'TestUser')
        .typeText('#password', 'testpass')
        .click('#sign-in');
});
```

The [t.useRole](../testcontroller/userole.md) method switches the user account to the specified role. Switch to [Role.anonymous()](../role/anonymous.md) to log out.

## Options

{% include authentication/role-options.md %}
