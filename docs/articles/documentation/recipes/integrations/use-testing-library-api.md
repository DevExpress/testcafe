---
layout: docs
title: Use Testing Library API
permalink: /documentation/recipes/integrations/use-testing-library-api.html
---
# Use Testing Library API

[Testing Library](https://testing-library.com) is a family of libraries that drives tests from the <b>_user's perspective_</b> and provides a consistent test API across testing and UI frameworks. Testing Library makes it easy for you to migrate your tests between frameworks, or test websites that use different JavaScript libraries for the UI.

## Install

```sh
npm install --save-dev @testing-library/testcafe
```

Refer to the [Testing Library site](https://testing-library.com/docs/testcafe-testing-library/intro#install) for more detailed instructions.

## Import Testing Library

Use [TestCafe client script import](../../guides/advanced-guides/inject-client-scripts.md#inject-a-module) to add the Testing Library UMD module to the tested pages.

For instance, you can do this with the [clientScripts](../../reference/configuration-file.md#clientscripts) configuration file property:

```json
"clientScripts": [
    {
        "module": "@testing-library/dom/dist/@testing-library/dom.umd.js"
    }
]
```

## Use Testing Library API in Tests

Refer to the [Testing Library documentation](https://testing-library.com/docs/testcafe-testing-library/intro) for the detailed API description.

The following example demonstrates TestCafe actions whose target elements are queried with the Testing Library API:

```js
import * as screen from '@testing-library/testcafe';

test('getByPlaceHolderText', async t => {
    await t.typeText(
        screen.getByPlaceholderText('Placeholder Text'),
        'Hello Placeholder'
    );
});

test('getByText', async t => {
    await t.click(screen.getByText('getByText'))
});

test('getByLabelText', async t => {
    await t.typeText(
        screen.getByLabelText('Label For Input Labelled By Id'),
        'Hello Input Labelled By Id'
    );
});

test('queryAllByText', async t => {
    await t.expect(screen.queryAllByText('Button Text').exists).ok()
    await t.expect(screen.queryAllByText('Non-existing Button Text').exists).notOk()
});
```
