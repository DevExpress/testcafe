---
layout: docs
title: Working with &lt;iframes&gt;
permalink: /documentation/test-api/working-with-iframes.html
checked: true
---
# Working with \<iframes\>

At any moment, a TestCafe test has its [browsing context](https://html.spec.whatwg.org/multipage/browsers.html#windows)
limited to either the main window or an `<iframe>`. To use an `<iframe>` in your test,
you need to switch the context from the main window to this `<iframe>` (and then probably back).
Likewise, if several `<iframes>` are involved in your test, you will have to switch between them.

To do this, use the `switchToIframe` and `switchToMainWindow` methods of the [test controller](test-code-structure.md#test-controller).

## Switching to an \<iframe\>

```text
t.switchToIframe( selector )
```

Switches the test's browsing context to the specified `<iframe>`.

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies an `<iframe>` on the tested page. See [Selecting Target Elements](actions/README.md#selecting-target-elements).

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

## Switching Back to the Main Window

```text
t.switchToMainWindow()
```

Switches the test's browsing context from an `<iframe>` back to the main window.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('switching back to main window', async t => {
    await t
        .switchToIframe('#iframe-1')
        .click('#button-in-iframe-1')
        .switchToMainWindow()
        .click('#button-in-main-window');
});
```
