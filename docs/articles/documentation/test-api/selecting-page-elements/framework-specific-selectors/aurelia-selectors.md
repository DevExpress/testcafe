---
layout: docs
title: Aurelia Selectors
permalink: /documentation/test-api/selecting-page-elements/framework-specific-selectors/aurelia-selectors.html
---
# Aurelia Selectors

This plugin provides selector extensions for Aurelia. You can select page elements by JS expressions to which the element's attributes are bound.

## Install

```sh
npm install testcafe-aurelia-selectors
```

## Selector Extensions

`AureliaSelector` contains a set of static methods to search for an HTML element by the specified binding (`byValueBind`, `byShowBind`, etc.).

Import `AureliaSelector` from the `testcafe-aurelia-selectors` module and use it to call the required static method.

### Example

```js
import AureliaSelector from 'testcafe-aurelia-selectors';

fixture `TestFixture`
    .page('http://todomvc.com/examples/aurelia/');

test('add new item', async t => {
    await t.typeText(AureliaSelector.byValueBind('newTodoTitle'), 'new item')
        .pressKey('enter')
        .expect(AureliaSelector.byShowBind('items.length').exists).ok();
});
```

### API

To learn about the API, see the [repository documentation](https://github.com/miherlosev/testcafe-aurelia-selectors/blob/master/README.md).