---
layout: docs
title: Runner.clientScripts Method
permalink: /documentation/reference/testcafe-api/runner/clientscripts.html
---
# Runner.clientScripts Method

Injects scripts into pages visited during the tests. Use this method to introduce client-side mock functions or helper scripts.

```text
async clientScripts( script[, script2[, ...[, scriptN]]] ) → this
```

Parameter | Type                | Description
--------- | ------------------- | ------------
`script`, `script2`, `scriptN`  | String &#124; Object &#124; Array | Scripts to inject into the tested pages.

## Inject a JavaScript File

{% capture syntax %}

```text
runner.clientScripts(filePath | { path: filePath })
runner.clientScripts(filePath | { path: filePath }, ...)
runner.clientScripts([ filePath | { path: filePath } ])
```

{% endcapture %}
{% include client-scripts/inject-javascript-file.md syntax=syntax relativePaths="cwd" %}
**Example**

```js
runner.clientScripts('assets/jquery.js');
// or
runner.clientScripts({ path: 'assets/jquery.js' });
```

## Inject a Module

{% capture syntax %}

```text
runner.clientScripts( { module: moduleName } )
runner.clientScripts( { module: moduleName }, ... )
runner.clientScripts([ { module: moduleName } ])
```

{% endcapture %}
{% include client-scripts/inject-module.md syntax=syntax %}
**Example**

```js
runner.clientScripts({ module: 'lodash' });
```

## Inject Script Code

{% capture syntax %}

```text
runner.clientScripts({ content: code })
runner.clientScripts({ content: code }, ...)
runner.clientScripts([ { content: code } ])
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

runner.clientScripts({ content: mockDate });
```

## Provide Scripts for Specific Pages

{% capture syntax %}

```text
runner.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
})

runner.clientScripts({
    page: url,
    path: filePath | module: moduleName | content: code
}, ...)

runner.clientScripts([
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
runner.clientScripts({
    page: /\/user\/profile\//,
    path: 'dist/jquery.js'
});
```

The [fixture.clientScripts](../../test-api/fixture/clientscripts.md) and [test.clientScripts](../../test-api/test/clientscripts.md) methods allow you to inject scripts into pages visited during an individual fixture or test.

See [Inject Scripts into Tested Pages](../../../guides/advanced-guides/inject-client-scripts.md) for more information.

*Related configuration file property*: [clientScripts](../../configuration-file.md#clientscripts)
