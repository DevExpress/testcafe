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

The `credentials` parameter requires `username` and `password`.
For NTLM authentication, the server may require additional information, such as the workstation ID and the domain name.
