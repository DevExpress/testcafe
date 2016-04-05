---
layout: docs
title: Action Options
permalink: /documentation/test-api/actions/action-options.html
---
# Action Options

This topic describes three types of [test action](index.md) options.

* [Mouse Action Options](#mouse-action-options)
* [Click Action Options](#click-action-options)
* [Typing Action Options](#typing-action-options)

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
    offsetY: Number
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed during the mouse action.                                                                                     | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates relative to the top-left corner of the target element. Define a point where the action is performed or started. Must be integers. | The center of the target element.

Mouse action options are used in the [t.drag](drag-element.md#drag-an-element-by-an-offset),
[t.dragToElement](drag-element.md#drag-an-element-onto-another-one) and [t.hover](hover.md) actions.

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
    caretPos: Number
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed during the mouse action.                                                                                     | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates relative to the top-left corner of the target element. Define a point where the action is performed or started. Must be integers. | The center of the target element.
`caretPos`                     | Number  | The initial caret position if the action is performed on a text input field. Must be a positive integer or `0`.                                             | The length of the input field content.

Click action options are used in the [t.click](click.md), [t.doubleClick](double-click.md) and [t.rightClick](right-click.md) actions.

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
    replace: Boolean
}
```

Parameter                      | Type    | Description                                                                                                                                           | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed while typing.                                                                                          | `false`
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates relative to the top-left corner of the target element. Define a point that is clicked to set input focus. Must be integers. | The center of the target element.
`caretPos`                     | Number  | The initial caret position. Must be a positive integer or `0`.                                                                                        | The length of the input field content.
`replace`                      | Boolean | `true` to remove the current text in the target element, and `false` to leave the text as is.                                                         | `false`

Typing action options are used in the [t.typeText](type-text.md) action.