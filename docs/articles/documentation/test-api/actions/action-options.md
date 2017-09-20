---
layout: docs
title: Action Options
permalink: /documentation/test-api/actions/action-options.html
checked: true
---
# Action Options

This topic describes [test action](README.md) options.

* [Basic Action Options](#basic-action-options)
* [Mouse Action Options](#mouse-action-options)
* [DragToElement Action Options](#dragtoelement-action-options)
* [Click Action Options](#click-action-options)
* [Typing Action Options](#typing-action-options)

## Basic Action Options

Provide additional parameters for an action.

```js
{
    speed: Number
}
```

Parameter | Type   | Description                                                                                     | Default
--------- | ------ | ----------------------------------------------------------------------------------- | ------------------------------------------
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A number between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](../../using-testcafe/command-line-interface.md#--speed-factor), [API](../../using-testcafe/programming-interface/runner.md#run) or in [test code](../test-code-structure.md#setting-test-speed), the action speed setting overrides test speed. | `1`

Basic action options are used in the [t.pressKey](press-key.md),
[t.selectText](select-text.md#select-text-in-input-elements), [t.selectTextAreaContent](select-text.md#select-textarea-content) and
[t.selectEditableContent](select-text.md#perform-selection-within-editable-content) actions.

**Example**

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example/`

test('My Test', async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, ' Parker', { speed: 0.1 });
});
```

## Mouse Action Options

Provide additional parameters for a mouse action.

```js
{
    modifiers: {
        ctrl: Boolean,
        alt: Boolean,
        shift: Boolean,
        meta: Boolean
    },

    offsetX: Number,
    offsetY: Number,
    speed: Number
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed during the mouse action.                                                                                     | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates that define a point where the action is performed or started. If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element. If an offset is a negative integer, they are calculated relative to the bottom-right corner. | The center of the target element.
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A value between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](../../using-testcafe/command-line-interface.md#--speed-factor) or [programmatically](../../using-testcafe/programming-interface/runner.md#run), the action speed setting overrides test speed. | `1`

Mouse action options are used in the [t.drag](drag-element.md#drag-an-element-by-an-offset) and [t.hover](hover.md) actions.

**Example**

```js
import { Selector } from 'testcafe';

const sliderHandle = Selector('.ui-slider-handle');

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example/`

test('My Test', async t => {
    await t
        .drag(sliderHandle, 360, 0, {
            offsetX: 10,
            offsetY: 10,
            modifiers: {
                shift: true
            }
        });
});
```

## DragToElement Action Options

Provides additional parameters for the `t.dragToElement` action.

```js
{
    modifiers: {
        ctrl: Boolean,
        alt: Boolean,
        shift: Boolean,
        meta: Boolean
    },

    offsetX: Number,
    offsetY: Number,
    destinationOffsetX: Number,
    destinationOffsetY: Number,
    speed: Number
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed during the drag action.                                                                                     | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates that define a point where dragging is started. If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element. If an offset is a negative integer, they are calculated relative to the bottom-right corner. | The center of the target element.
`destinationOffsetX`, `destinationOffsetY` | Number  | Mouse pointer coordinates that define a point where dragging is finished. If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element. If an offset is a negative integer, they are calculated relative to the bottom-right corner. | The center of the destination element.
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A value between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](../../using-testcafe/command-line-interface.md#--speed-factor) or [programmatically](../../using-testcafe/programming-interface/runner.md#run), the action speed setting overrides test speed. | `1`

DragToElement options are used in the [t.dragToElement](drag-element.md#drag-an-element-onto-another-one) action.

**Example**

```js
import { Selector } from 'testcafe';

const fileIcon      = Selector('.file-icon');
const directoryPane = Selector('.directory');

fixture `My Fixture`
    .page `https://example.com/`;

test('My Test', async t => {
    await t
        .dragToElement(fileIcon, directoryPane, {
            offsetX: 10,
            offsetY: 10,
            destinationOffsetX: 100,
            destinationOffsetY: 50,
            modifiers: {
                shift: true
            }
        });
});
```

## Click Action Options

Provide additional parameters for a click action.

```js
{
    modifiers: {
        ctrl: Boolean,
        alt: Boolean,
        shift: Boolean,
        meta: Boolean
    },

    offsetX: Number,
    offsetY: Number,
    caretPos: Number,
    speed: Number
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed during the mouse action.                                                                                     | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates that define a point where the action is performed or started. If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element. If an offset is a negative integer, they are calculated relative to the bottom-right corner. | The center of the target element.
`caretPos`                     | Number  | The initial caret position if the action is performed on a text input field. A zero-based integer.                                                          | The length of the input field content.
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A value between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](../../using-testcafe/command-line-interface.md#--speed-factor) or [programmatically](../../using-testcafe/programming-interface/runner.md#run), the action speed setting overrides test speed. | `1`

Click action options are used in the [t.click](click.md), [t.doubleClick](double-click.md) and [t.rightClick](right-click.md) actions.

**Example**

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example/`

test('My Test', async t => {
    await t
        .typeText(nameInput, 'Pete Parker')
        .click(nameInput, { caretPos: 4 })
        .pressKey('r');
});
```

## Typing Action Options

Provide additional parameters for a typing operation.

```js
{
    modifiers: {
        ctrl: Boolean,
        alt: Boolean,
        shift: Boolean,
        meta: Boolean
    },

    offsetX: Number,
    offsetY: Number,
    caretPos: Number,
    replace: Boolean,
    paste: Boolean,
    speed: Number
}
```

Parameter                      | Type    | Description                                                                                                                                           | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed while typing.                                                                                          | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates that define a point where the action is performed or started. If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element. If an offset is a negative integer, they are calculated relative to the bottom-right corner. | The center of the target element.
`caretPos`                     | Number  | The initial caret position. A zero-based integer.                                                                                        | The length of the input field content.
`replace`                      | Boolean | `true` to remove the current text in the target element, and `false` to leave the text as it is.                                                         | `false`
`paste`                        | Boolean | `true` to insert the entire block of current text in a single keystroke (similar to a copy & paste function), and `false` to insert the current text character by character.                         | `false`
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A value between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](../../using-testcafe/command-line-interface.md#--speed-factor) or [programmatically](../../using-testcafe/programming-interface/runner.md#run), the action speed setting overrides test speed. | `1`

Typing action options are used in the [t.typeText](type-text.md) action.

**Example**

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example/`

test('My Test', async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Parker', { replace: true });
});
```