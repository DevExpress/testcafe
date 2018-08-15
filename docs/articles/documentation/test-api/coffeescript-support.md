---
layout: docs
title: CoffeeScript Support
permalink: /documentation/test-api/coffeescript-support.html
---
# CoffeeScript Support

TestCafe allows you to write tests with [CoffeeScript](https://coffeescript.org/).

**Example**

```coffee
import { Selector } from 'testcafe'

fixture 'CoffeeScript Example'
    .page 'https://devexpress.github.io/testcafe/example/'

nameInput = Selector '#developer-name'

test 'Test', (t) =>
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Paker', { replace: true })
        .typeText(nameInput, 'r', { caretPos: 2 })
        .expect(nameInput.value).eql 'Parker';
```

You can run CoffeeScript tests in the same manner as JavaScript tests. TestCafe automatically compiles the CoffeeScript code, so you do not need to compile it manually.