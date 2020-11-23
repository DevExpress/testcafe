---
layout: docs
title: Selector.shadowRoot Method
permalink: /documentation/reference/test-api/selector/shadowroot.html
---
# Selector.shadowRoot Method

Selects the shadow root hosted by an element.

```text
selector.shadowRoot() → Selector
```

Use `shadowRoot` to access the element's shadow root. Returns `null` if the shadow DOM is not `open`.

Chain other `Selector` methods to it to traverse the shadow tree.

> You cannot perform actions with a node returned by `shadowRoot()` or use it in assertions.
>
> Only use this element as an entry point for shadow DOM.

The sample below shows how to identify a shadow root and access elements in the shadow tree.

```js
import { Selector } from 'testcafe'

fixture `Target Shadow DOM elements`
    .page('https://devexpress.github.io/testcafe/example')

test('Get text within shadow tree', async t => {
    const shadowRoot = Selector('div').withAttribute('id', 'shadow-host').shadowRoot();
    const paragraph  = shadowRoot.child('p');

    await t.expect(paragraph.textContent).eql('This paragraph is in the shadow tree');

    await t.click(shadowRoot);
    // causes an error
    // do not target the shadow root directly or use it in assertions
});
```
