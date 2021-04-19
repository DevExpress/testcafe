---
layout: docs
title: t.dispatchEvent Method
permalink: /documentation/reference/test-api/testcontroller/dispatchevent.html
---
# t.dispatchEvent Method

```text
t.dispatchEvent(target, eventName[, options]) → this | Promise<any>
```

> Important! The `t.dispatchEvent` method is not supported in Internet Explorer 11.

Fires a DOM event on the `target` element.

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ----------------
`target`               | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the event target. See [Select Target Elements](#select-target-elements).
`eventName`            | String                                            | Event name. See [Event Types](#event-types)
`options`&#160;*(optional)* | Object                                       | A set of event parameters. See [Options](#options).

TestCafe fires [DOM events](https://developer.mozilla.org/en-US/docs/Web/API/Event) to imitate user actions on the webpage. For example, when you call [t.click](./click.md), TestCafe raises [mousedown](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event), [mouseup](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event), and [click](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) (and possibly other events if necessary) in succession.

Use `t.dispatchEvent` to raise customized events or to emulate actions TestCafe does not support out-of-the-box.

## Event Types

When you fire an event with `t.dispatchEvent`, TestCafe chooses an event constructor to invoke based on the `eventName` value. Depending on the constructor, different sets of `options` are available.

### Mouse Events

When you pass one of the following values as `eventName`, TestCafe dispatches a [Mouse Event](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent):

* `mouseup`
* `mousedown`
* `click`
* `dbclick`
* `mousemove`
* `mouseover`
* `mouseleave`
* `contextmenu`
* `drag`
* `dragend`
* `dragenter`
* `dragexit`
* `dragleave`
* `dragover`
* `dragstart`
* `drop`

TestCafe calls the [MouseEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent) to create a mouse event. Mouse events support [MouseEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#properties) in `options`.

Unless otherwise specified, the [*buttons* property](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons) is set to `1` and the event simulates a press of the primary pointer key (a left mouse click).

An example below fires the [mousedown](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event) and [mouseup](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event) events to simulate the user holding down a left-click on a button for 5 seconds.

```js
import { Selector } from 'testcafe';

fixture`Trigger Mouse Events`
    .page('www.example.com');

test('Left-click a button for 5 seconds', async t => {
    const target = Selector('#target');

    await t
        .dispatchEvent(target, 'mousedown')
        .wait(5000)
        .dispatchEvent(target, 'mouseup');
});
```

An example below simulates a 5 second long *right-click* on the target element.

```js
import { Selector } from 'testcafe';

fixture`Trigger Mouse Events`
    .page('www.example.com');

test('Right-click a button for 5 seconds', async t => {
    const target  = Selector('#target');
    const options = {
        buttons: 2
    };

    await t
        .dispatchEvent(target, 'mousedown', options)
        .wait(5000)
        .dispatchEvent(target, 'mouseup', options);
});
```

In this example, the *buttons* property of `options` is set to `2`, which imitates the secondary mouse button press.

### Keyboard Events

When you pass one of the following values as `eventName`, TestCafe dispatches a [Keyboard Event](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent):

* `keydown`
* `keyup`
* `keypress`

TestCafe calls the [KeyboardEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent) to create a keyboard event. Keyboard events support [KeyboardEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#properties) in `options`.

### Input Events

When you pass one of the following values as `eventName`, TestCafe dispatches an [Input Event](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent):

* `input`
* `beforeinput`

TestCafe calls the [InputEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/InputEvent) to create an input event. Input events support [InputEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent#properties) in `options`.

### Focus Events

When you pass one of the following values as `eventName`, TestCafe dispatches a [Focus Event](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent):

* `blur`
* `focus`
* `focusin`
* `focusout`

TestCafe calls the [FocusEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/FocusEvent) to create a focus event. Focus events support [FocusEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent#properties) in `options`.

### Pointer Events

When you pass one of the following values as `eventName`, TestCafe dispatches a [Pointer Event](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent):

* `pointerover`
* `pointerenter`
* `pointerdown`
* `pointermove`
* `pointerrawupdate`
* `pointerup`
* `pointercancel`
* `pointerout`
* `pointerleave`

TestCafe calls the [PointerEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/PointerEvent) to create a pointer event. Pointer events support [PointerEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent#properties) in `options`.

### Custom Events

Custom Events are all events that are neither [Mouse](#mouse-events), [Keyboard](#keyboard-events), [Input](#input-events), [Focus](#focus-events) nor [Pointer](#pointer-events) events.

TestCafe calls the [CustomEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) to create a custom event. Custom events support [CustomFocusEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#properties) in `options`.

In the example below, `foo` is passed as `eventName` to `options`. Since TestCafe can't recognize the event, it uses the CustomEvent constructor.

```js
import { Selector } from 'testcafe';

fixture`Custom Events`
    .page('www.example.com');

test('Dispatch a CustomEvent', async t => {
    const target  = Selector('#target');

    await t
        .dispatchEvent(target, 'foo')
});
```

You can tell TestCafe which constructor to use. See [Explicit Constructor Assignment](#explicit-constructor-assignment).

## Options

Use the `options` object to specify parameters for events fired with `t.dispatchEvent`.

All DOM events support the following `options` properties:

* [Event Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#properties)

Unless otherwise specified, events have `bubbles` and `cancelable` options set to `true`.

Depending on the `eventName` parameter, a different constructor is called for an event and different sets of additional `options` are available. See [Event Types](#event-types).

You can explicitly set a constructor for an event. See [Explicit Constructor Assignment](#explicit-constructor-assignment).

### Explicit Constructor Assignment

You can explicitly tell TestCafe which event constructor to use. Pass the `eventConstructor` property to `options` (for example, `eventConstructor: 'TouchEvent'`).

The following example fires a [non-cancelable](https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable), [non-bubbling](https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles) `TouchEvent` on `target`.

```js
import { Selector } from 'testcafe';

fixture`Dispatch Events`
    .page('./index.html');

test('Dispatch a TouchEvent', async t => {
    const target    = Selector('#target');

    const eventArgs = {
        cancelable: false,
        bubbles:    false
    };

    const options = Object.assign(
        { eventConstructor: 'TouchEvent' },
        eventArgs
    );

    await t
        .dispatchEvent(target, 'touchstart', options)
});
```

Because `eventConstructor: 'TouchEvent'` is passed to `options`, TestCafe calls the `TouchEvent` constructor to create the event. You can use [TouchEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent#properties) as `options` for this event.

## Select Target Elements

{% include actions/selector-parameter.md %}
