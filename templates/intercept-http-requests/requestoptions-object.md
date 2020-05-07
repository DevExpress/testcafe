The `RequestOptions` object contains the request parameters.

Property | Type | Description
-------- | ---- | ------------
`headers`     | Object  | The request headers in the property-value form.
`body`        | [Buffer](https://nodejs.org/api/buffer.html) | The request body.
`url`    | String | The URL to which the request is sent.
`protocol` | String | The protocol to use. Default: *http:*.
`hostname` | String | The alias for the host.
`host`     | String | The domain name or IP address of the server to issue the request to. Default: *localhost*.
`port`     | Number | The port of the remote server. Default: *80*.
`path`     | String | The request path. Should include query string if any. E.G. *'/index.html?page=12'*. An exception is thrown when the request path contains illegal characters. Currently, only spaces are rejected but that may change in the future. Default: *'/'*.
`method`   | String | The string specifying the HTTP request method. Default: *'GET'*.
`credentials` | Object | Credentials that were used for authentication in the current session using NTLM or Basic authentication. For HTTP Basic authentication, these are `username` and `password`. NTLM authentication additionally specifies `workstation` and `domain`. See [HTTP Authentication](/testcafe/documentation/guides/advanced-guides/authentication.html#http-authentication).
`proxy`       | Object | If a proxy is used, the property contains information about its `host`, `hostname`, `port`, `proxyAuth`, `authHeader` and `bypassRules`.