---
layout: docs
title: Test.httpAuth Method
permalink: /documentation/reference/test-api/test/httpauth.html
---
# Test.httpAuth Method

Specifies the credentials for HTTP [Basic](https://en.wikipedia.org/wiki/Basic_access_authentication) and [Windows (NTLM)](https://en.wikipedia.org/wiki/Integrated_Windows_Authentication) authentication.

```text
test.httpAuth( credentials )
```

{% include authentication/http-credentials.md %}

TestCafe uses the specified credentials for all requests that require authentication in the test. To specify credentials to be used for all tests in a fixture, use the [fixture.httpAuth](../fixture/httpauth.md) method.
