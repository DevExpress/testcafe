Basic action options provide additional parameters for the `t.pressKey`, `t.selectText`, `t.selectTextAreaContent` and `t.selectEditableContent` actions.

```js
{
    speed: Number
}
```

Parameter | Type   | Description                                                                                     | Default
--------- | ------ | ----------------------------------------------------------------------------------- | ------------------------------------------
`speed`   | Number | The speed of action emulation. Defines how fast TestCafe performs the action when running tests. A number between `1` (the maximum speed) and `0.01` (the minimum speed). If test speed is also specified in the [CLI](/testcafe/documentation/reference/command-line-interface.html#--speed-factor), [API](/testcafe/documentation/reference/testcafe-api/runner/run.html) or in [test code](/testcafe/documentation/reference/test-api/testcontroller/settestspeed.html), the action speed setting overrides test speed. | `1`

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
