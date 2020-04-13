---
layout: docs
title: Runner.clientScripts Method
permalink: /documentation/reference/api/runner/clientscripts.html
---
# Runner.clientScripts Method

Injects scripts into pages visited during the tests. Use this method to introduce client-side mock functions or helper scripts.

```text
async clientScripts( script[, script2[, ...[, scriptN]]] ) → this
```

Parameter | Type                | Description
--------- | ------------------- | ------------
`script`, `script2`, `scriptN`  | String &#124; Object &#124; Array | Scripts to inject into the tested pages. See [Provide Scripts to Inject](../../../guides/advanced-guides/inject-client-scripts.md#provide-scripts-to-inject) to learn how to specify them.

> Relative paths are resolved against the current working directory.

You can use the [page](../../../guides/advanced-guides/inject-client-scripts.md#provide-scripts-for-specific-pages) option to specify pages into which scripts should be injected. Otherwise, TestCafe injects scripts into all pages visited during the test run.

```js
runner.clientScripts('assets/jquery.js');
```

```js
runner.clientScripts([
    {
        module: 'lodash'
    },
    {
        path: 'scripts/react-helpers.js',
        page: 'https://myapp.com/page/'
    }
]);
```

The [fixture.clientScripts](../test-api/fixture/clientscripts.md) and [test.clientScripts](../test-api/test/clientscripts.md) methods allow you to inject scripts into pages visited during an individual fixture or test.

See [Inject Scripts into Tested Pages](../../../guides/advanced-guides/inject-client-scripts.md) for more information.

*Related configuration file property*: [clientScripts](../../configuration-file.md#clientscripts)
