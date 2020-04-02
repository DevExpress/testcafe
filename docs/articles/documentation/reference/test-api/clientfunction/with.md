---
layout: docs
title: with Method
permalink: /documentation/reference/test-api/clientfunction/with.html
---
# with Method

You can overwrite client function options by using the ClientFunction's `with` method.

```text
clientFunction.with( options ) → ClientFunction
```

`with` returns a new client function with a different set of options that includes options
from the original function and new `options` that overwrite the original ones.

The sample below shows how to overwrite the client function options.

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
