---
layout: docs
title: t.switchToIframe Method
permalink: /documentation/reference/test-api/testcontroller/switchtoiframe.html
---
# t.switchToIframe Method

Switches to an \<iframe\>.

```text
t.switchToIframe( selector )
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

## Select Target Elements

{% include actions/selector-parameter.md %}
