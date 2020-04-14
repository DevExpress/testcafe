---
layout: docs
title: Fixture.httpAuth Method
permalink: /documentation/reference/test-api/fixture/httpauth.html
---
# Fixture.httpAuth Method

Specifies the credentials for HTTP [Basic](https://en.wikipedia.org/wiki/Basic_access_authentication) and [Windows (NTLM)](https://en.wikipedia.org/wiki/Integrated_Windows_Authentication) authentication.

```text
fixture.httpAuth( credentials )
```

{% include authentication/http-credentials.md %}

TestCafe uses credentials specified with `fixture.httpAuth` for all requests that require authentication within the fixture. To specify credentials to be used in individual tests, use the [test.httpAuth](../test/httpauth.md) method.
