---
layout: docs
title: Fixture.clientScripts Method
permalink: /documentation/reference/test-api/fixture/clientscripts.html
---
# Fixture.clientScripts Method

[Injects scripts](../../../guides/advanced-guides/inject-client-scripts.md) into all pages visited during the test.

```text
fixture.clientScripts( script[, script2[, ...[, scriptN]]] )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`script`, `script2`, `scriptN` | String &#124; Object &#124; Array | Scripts to inject into the tested pages. See [Provide Scripts to Inject](../../../guides/advanced-guides/inject-client-scripts.md#provide-scripts-to-inject) for information on how to specify scripts.

```js
fixture `My fixture`
    .page `http://example.com`
    .clientScripts('assets/jquery.js');
```

```js
fixture
    .clientScripts({
        page: /\/user\/profile\//,
        content: 'Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);'
    });
```

> Relative paths resolve against the test file location.

You can use the [page](../../../guides/advanced-guides/inject-client-scripts.md#provide-scripts-for-specific-pages) option to specify pages into which scripts should be injected. If this option is missing, TestCafe injects scripts into all pages visited during the test.

## Inject a JavaScript File

{% capture syntax %}

```text
fixture.clientScripts(filePath | { path: filePath })
fixture.clientScripts(filePath | { path: filePath }, ...)
fixture.clientScripts([ filePath | { path: filePath } ])
```

{% endcapture %}
{% include client-scripts/inject-javascript-file.md syntax=syntax relativePaths="local" %}
**Example**

```js
fixture `My fixture`
    .page `https://example.com`
    .clientScripts('assets/jquery.js');
```

## Inject a Module

{% capture syntax %}

```text
fixture.clientScripts( { module: moduleName } )
fixture.clientScripts( { module: moduleName }, ... )
fixture.clientScripts([ { module: moduleName } ])
```

{% endcapture %}
{% include client-scripts/inject-module.md syntax=syntax %}
**Example**

```js
fixture `My fixture`
    .page `https://example.com`
    .clientScripts({ module: 'lodash' });
```

## Inject Script Code

{% capture syntax %}

```text
fixture.clientScripts({ content: code })
fixture.clientScripts({ content: code }, ...)
fixture.clientScripts([ { content: code } ])
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

fixture `My fixture`
    .page `https://example.com`
    .clientScripts({ content: mockDate });
```

## Provide Scripts for Specific Pages

{% capture syntax %}

```text
fixture.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
})

fixture.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
}, ...)

fixture.clientScripts([
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
fixture `My fixture`
    .page `https://example.com`
    .clientScripts({
        page: /\/user\/profile\//,
        path: 'dist/jquery.js'
    });
```