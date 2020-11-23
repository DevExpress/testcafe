---
layout: docs
title: t.switchToIframe Method
permalink: /documentation/reference/test-api/testcontroller/switchtoiframe.html
---
# t.switchToIframe Method

Switches to an \<iframe\>. Can be chained with other `TestController` methods.

```text
t.switchToIframe(selector) → this | Promise<any>
```

Switches the test's browsing context to the specified `<iframe>`.

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies an `<iframe>` on the tested page. See [Select Target Elements](#select-target-elements).

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`
    .page `http://example.com`;

test('switching to an iframe', async t => {
    const getLocation = ClientFunction(() => window.location.href);

    // NOTE: the ClientFunction will be executed in TOP window's context
    console.log(await getLocation());

    await t
        .click('#button-in-main-window')
        .switchToIframe('#iframe-1')
        .click('#button-in-iframe-1');

    // NOTE: the ClientFunction will be executed in IFRAME window's context
    console.log(await getLocation());
});
```

You can switch to the main window from the `<iframe>` with the [t.switchToMainWindow](switchtomainwindow.md) method.

## Wait Until an \<iframe\> Is Loaded

TestCafe implements [wait mechanisms](../../../guides/concepts/built-in-wait-mechanisms.md) that automatically suspend the test until all required page elements are loaded and ready for interaction. These mechanisms apply to page loads, animations, XHR requests, iframe initializations, etc. TestCafe waits until the target element is ready, or reports an error if this does not happen within a timeout.

This example shows how to allow more time for an `iframe` to load if the [default timeout](../../command-line-interface.md#--selector-timeout-ms) is not enough.

```js
fixture `Wait for an iframe to load`
    .page `https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/jQuery/Light/`;

test('Wait for an iframe to load', async t => {
    const iframeSelector = Selector('#demoFrame', { timeout: 60000 });

    await t.switchToIframe(iframeSelector);
});
```

In this example, the [timeout](../selector/constructor.md#optionstimeout) in the [Selector constructor](../selector/constructor.md) options is set to `60` seconds so that the `iframe` has one minute to initialize.

## Select Target Elements

{% include actions/selector-parameter.md %}
