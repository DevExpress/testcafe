---
layout: docs
title: Runner.useProxy Method
permalink: /documentation/reference/testcafe-api/runner/useproxy.html
---
# Runner.useProxy Method

Specifies the proxy server used in your local network to access the Internet. Allows TestCafe to bypass the proxy when it accesses specific resources.

```text
async useProxy(host [, bypassRules]) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`host`    | String | The proxy server host.
`bypassRules`&#160;*(optional)* | String &#124; Array | A set of rules that specify which resources TestCafe should access directly.

If you access the Internet through a proxy server, use the `useProxy` method to specify its host.

When you use a proxy server, you may still need to access local or external resources directly. In this instance, provide their URLs in the `bypassRules` option.

The `bypassRules` parameter takes one or several URLs that require direct access. You can replace parts of the URL with the `*` wildcard that corresponds to a string of any length. Wildcards at the beginning and end of the rules can be omitted (`*.mycompany.com` and `.mycompany.com` have the same effect).

*Related configuration file properties*:

* [proxy](../../configuration-file.md#proxy)
* [proxyBypass](../../configuration-file.md#proxybypass)

**Examples**

The following example shows how to use the proxy server at `proxy.corp.mycompany.com`:

```js
runner.useProxy('proxy.corp.mycompany.com');
```

In the example below, the proxy server address is `172.0.10.10:8080` and two resources at `localhost:8080` and `internal-resource.corp.mycompany.com` are accessed directly.

```js
runner.useProxy('172.0.10.10:8080', ['localhost:8080', 'internal-resource.corp.mycompany.com']);
```

The `*.mycompany.com` proxy bypass rule means that all URLs in `mycompany.com` subdomains are accessed directly.

```js
runner.useProxy('proxy.corp.mycompany.com', '*.mycompany.com');
```

You can also use the proxy host to specify authentication credentials.

```js
runner.useProxy('username:password@proxy.mycorp.com');
```
