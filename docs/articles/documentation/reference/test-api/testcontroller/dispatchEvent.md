---
layout: docs
title: t.dispatchEvent Method
permalink: /documentation/reference/test-api/testcontroller/dispatchevent.html
---
# t.dispatchEvent Method

```text
t.dispatchEvent(target, eventName[, options]) → this | Promise<any>
```

> Important! The `t.dispatchEvent` method is not supported in Internet Explorer 11 and earlier.

Fires a DOM event on the `target` element.

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ----------------
`target`               | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the event target. See [Select Target Elements](#select-target-elements).
`eventName`            | String                                            | Event name. See [MDN Event Reference](https://developer.mozilla.org/en-US/docs/Web/Events)
`options`&#160;*(optional)* | Object                                       | A set of action parameters. See [Options](#options).

## Options

Use the `options` object to specify parameters for events fired with `t.dispatchEvent`.

All DOM events support the following `options` properties:

* [Event Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#properties)

Unless otherwise specified, events have `bubbles` and `cancelable` options set to `true`.

Depending on the `eventName` parameter, a different constructor is called for an event and different sets of additional `options` are available.

You can explicitly set a constructor for an event. See [Explicit Constructor Assignment](#explicit-constructor-assignment).

### Mouse Events

You can use `t.dispatchEvent` to trigger a mouse event (like [mousedown](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event) or [dblclick](https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event)).

An example below fires the [mousedown](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event) and [mouseup](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event) events to simulate the user holding down a left click on a button for 5 seconds.

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

Mouse events support the following `options` properties:

* [Event Properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#properties)
* [UIEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent#properties)
* [MouseEvent Properties](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#properties)

Unless otherwise specified, the [*buttons* property](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons) is set to `1`, so the event simulates a press of the primary pointer key (left click in case of a mouse).

An example below simulates a 5 second long *right click* on the target element.

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

### Keyboard Events

{% include events.md name = "KeyboardEvent" %}

### Input Events

{% include events.md name = "InputEvent" %}

### Focus Events

{% include events.md name = "FocusEvent" %}

### Pointer Events

{% include events.md name = "PointerEvent" %}

### Custom Events

Custom Events are all events that are neither [Mouse](#mouse-events), [Keyboard](#keyboard-events), [Input](#input-events), [Focus](#focus-events) nor [Pointer](#pointer-events) events.

When you dispatch a custom event, TestCafe passes the `options` properties to the [CustomEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent).

CustomEvent Constructor supports the following `options` properties:

* [Event Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#properties)
* [CustomEvent Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#properties)

### Explicit Constructor Assignment

You can explicitly tell TestCafe to use a different constructor. Pass the `eventConstructor` property to `options` (for example, `eventConstructor: 'TouchEvent'`).

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

Since this event is explicitly assigned the `TouchEvent` constructor, it supports the following `options`:

* [Event Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#properties)
* [UIEvent Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent#properties)
* [TouchEvent Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent#properties)

## Select Target Elements

{% include actions/selector-parameter.md %}
