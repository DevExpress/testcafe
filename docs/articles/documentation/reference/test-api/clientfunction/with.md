---
layout: docs
title: ClientFunction.with Method
permalink: /documentation/reference/test-api/clientfunction/with.html
---
# ClientFunction.with Method

Overwrites [client function options](../clientfunction/constructor.md#options).

```text
clientFunction.with( options ) → ClientFunction
```

`with` returns a new client function with a different set of options. This includes options from the original function and new `options` that overwrite the original.

The sample below shows how to overwrite client function options.

```js
import { Selector, ClientFunction } from 'testcafe';

const option = Selector('option');

const thirdOption = option.nth(2);

const getThirdOptionHTML = ClientFunction(() => option().innerHTML, {
     dependencies: { option: thirdOption }
});

const fourthOption = option.nth(3);

const getFourthOptionHTML = getThirdOptionHTML.with({
    dependencies: { option: fourthOption }
});
```
