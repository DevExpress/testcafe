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

#### byValueBind

Selects an element whose `value` attribute is bound to the specified expression.

```text
byValueBind(expression, parentSelector)
```

Parameter                   | Description
--------------------------- | -----------
expression                        | The JavaScript expression to which the element's `value` attribute is bound.
parentSelector&#160;*(optional)*  | A TestCafe [selector](../selectors.md). If specified, TestCafe will search for the target element among the descendants of the element identified by this selector.

#### byShowBind

Selects an element whose visibility is bound to the specified expression.

```text
byShowBind(expression, parentSelector)
```

Parameter                   | Description
--------------------------- | -----------
expression                       | The JavaScript expression to which the element's visibility is bound.
parentSelector&#160;*(optional)*  | A TestCafe [selector](../selectors.md). If specified, TestCafe will search for the target element among the descendants of the element identified by this selector.

#### byCheckedBind

Selects an element whose checked state is bound to the specified expression (for checkbox and radio input elements).

```text
byCheckedBind(expression, parentSelector)
```

Parameter                   | Description
--------------------------- | -----------
expression                       | The JavaScript expression to which the element's checked state is bound.
parentSelector&#160;*(optional)*  | A TestCafe [selector](../selectors.md). If specified, TestCafe will search for the target element among the descendants of the element identified by this selector.

#### byFocusBind

Selects an element whose focus state is bound to the specified expression.

```text
byFocusBind(expression, parentSelector)
```

Parameter                   | Description
--------------------------- | -----------
expression                       | The JavaScript expression to which the element's focus state is bound.
parentSelector&#160;*(optional)*  | A TestCafe [selector](../selectors.md). If specified, TestCafe will search for the target element among the descendants of the element identified by this selector.

#### byDbClickDelegate

Selects an element whose `dblclick` event is handled by the specified expression.

```text
byDbClickDelegate(expression, parentSelector)
```

Parameter                   | Description
--------------------------- | -----------
expression                  | The expression that handles the element's `dblclick` event.
parentSelector&#160;*(optional)*  | A TestCafe [selector](../selectors.md). If specified, TestCafe will search for the target element among the descendants of the element identified by this selector.

#### byClickDelegate

Selects an element whose `click` event is handled by the specified expression.

```text
byClickDelegate(expression, parentSelector)
```

Parameter                   | Description
--------------------------- | -----------
expression                  | The expression that handles the element's `click` event.
parentSelector&#160;*(optional)*  | A TestCafe [selector](../selectors.md). If specified, TestCafe will search for the target element among the descendants of the element identified by this selector.