Mouse action options are used in `t.drag` and `t.hover` actions.

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
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A number between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](/testcafe/documentation/reference/command-line-interface.html#--speed-factor), [API](../../testcafe-api/runner/run.html) or in [test code](/testcafe/documentation/reference/test-api/testcontroller/settestspeed.html), the action speed setting overrides test speed. | `1`

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
