---
layout: docs
title: Test.clientScripts Method
permalink: /documentation/reference/test-api/test/clientscripts.html
---
# Test.clientScripts Method

[Injects scripts](../../../guides/advanced-guides/inject-client-scripts.md) into all pages visited during the test.

```text
test.clientScripts( script[, script2[, ...[, scriptN]]] )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`script`, `script2`, `scriptN` | String &#124; Object &#124; Array | Scripts to inject into the tested pages. See [Provide Scripts to Inject](../../../guides/advanced-guides/inject-client-scripts.md#provide-scripts-to-inject) for information on how to specify scripts.

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({ module: 'async' });
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({
        page: /\/user\/profile\//,
        content: 'Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);'
    });
```

> Relative paths are resolved against the test file location.

You can use the [page](../../../guides/advanced-guides/inject-client-scripts.md#provide-scripts-for-specific-pages) option to specify pages into which scripts should be injected. Otherwise, TestCafe injects scripts into all pages visited during the test.

## Inject a JavaScript File

{% capture syntax %}

```text
test.clientScripts(filePath | { path: filePath })
test.clientScripts(filePath | { path: filePath }, ...)
test.clientScripts([ filePath | { path: filePath } ])
```

{% endcapture %}
{% include client-scripts/inject-javascript-file.md syntax=syntax relativePaths="local" %}
**Example**

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts('assets/jquery.js');
```

## Inject a Module

{% capture syntax %}

```text
test.clientScripts( { module: moduleName } )
test.clientScripts( { module: moduleName }, ... )
test.clientScripts([ { module: moduleName } ])
```

{% endcapture %}
{% include client-scripts/inject-module.md syntax=syntax %}
**Example**

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({ module: 'lodash' });
```

## Inject Script Code

{% capture syntax %}

```text
test.clientScripts({ content: code })
test.clientScripts({ content: code }, ...)
test.clientScripts([ { content: code } ])
```

{% endcapture %}
{% include client-scripts/inject-code.md syntax=syntax %}
**Example**

```js
const mockDate = `
    Date.prototype.getTime = function () {
        return 42;
    };
`;

test
    ('My test', async t => { /* ... */ })
    .clientScripts({ content: mockDate });
```

## Provide Scripts for Specific Pages

{% capture syntax %}

```text
test.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
})

test.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
}, ...)

test.clientScripts([
    {
        page: url,
        path: filePath | module: moduleName | content: code
    }
])
```

{% endcapture %}
{% include client-scripts/specify-pages.md syntax=syntax regexp=true %}
**Example**

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({
        page: /\/user\/profile\//,
        path: 'dist/jquery.js'
    });
```
