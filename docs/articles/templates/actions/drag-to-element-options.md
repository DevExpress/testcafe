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
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A number between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](/testcafe/documentation/reference/command-line-interface.html#--speed-factor), [API](../../testcafe-api/runner/run.html) or in [test code](/testcafe/documentation/reference/test-api/testcontroller/settestspeed.html), the action speed setting overrides test speed. | `1`

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
