---
layout: docs
title: HTTP Authentication
permalink: /documentation/test-api/authentication/http-authentication.html
checked: true
---
# HTTP Authentication

TestCafe allows you to test web pages that are protected with HTTP [Basic](https://en.wikipedia.org/wiki/Basic_access_authentication)
or [Windows (NTLM)](https://en.wikipedia.org/wiki/Integrated_Windows_Authentication) authentication.
Use the `test.httpAuth` method to specify the credentials to be used by an individual test
and the `fixture.httpAuth` method to specify the credentials for the entire fixture.

```text
fixture.httpAuth( credentials )
```

```text
test.httpAuth( credentials )
```

Parameter     | Type   | Description
------------- | ------ | ------------------------------------------------
`credentials` | Object | Contains credentials used for authentication.

The `credentials` parameter has the following properties.

Parameter                       | Type   | Description
------------------------------- | ------ | --------------------------------------------------------------------
`username`                      | String | The user name for the account.
`password`                      | String | The password for the account.
`domain`&#160;*(optional)*      | String | The domain name.
`workstation`&#160;*(optional)* | String | The workstation's ID in the local network.

The `credentials` parameter is required to include `username` and `password`.
For NTLM authentication, the server may need additional information - the workstation ID and the domain name.

The specified credentials will be used for all requests that require authentication.

**Example**

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