---
layout: docs
title: Use Angular CLI Builder
permalink: /documentation/recipes/integrations/testing-library.html
redirect_from:
  - /documentation/recipes/testing-library.html
---

Use Testcafe Testing Library

# Guiding Principle

>The more your tests resemble the way your software is used, the more confidence they can give you.

See full [install instructions](https://testing-library.com/docs/testcafe-testing-library/intro#install) and [examples](https://testing-library.com/docs/testcafe-testing-library/intro) on testing-library.com

# Brief Example:

Add the following to your .testcaferc.json file:

```json
  "clientScripts": [
    { "module": "@testing-library/dom/dist/@testing-library/dom.umd.js" }
  ],
```

Write some tests: 
```javascript

import * as screen from '@testing-library/testcafe'

test('getByPlaceHolderText', async t => {
  await t.typeText(
    screen.getByPlaceholderText('Placeholder Text'),
    'Hello Placeholder'
  )
})
test('getByText', async t => {
  await t.click(screen.getByText('getByText'))
})

test('getByLabelText', async t => {
  await t.typeText(
    screen.getByLabelText('Label For Input Labelled By Id'),
    'Hello Input Labelled By Id'
  )
})

test('queryAllByText', async t => {
  await t.expect(screen.queryAllByText('Button Text').exists).ok()
  await t.expect(screen.queryAllByText('Non-existing Button Text').exists).notOk()
})
```
