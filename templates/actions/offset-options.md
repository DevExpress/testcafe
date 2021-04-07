Offset options apply to `t.scroll`, `t.scrollBy` and `t.scrollIntoView` actions.

```js
{
    offsetX: Number,
    offsetY: Number,
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`offsetX`, `offsetY`           | Number  | Coordinates that define the action's starting point. If positive, TestCafe calculates coordinates relative to the top-left corner of the target element. If negative, they are calculated relative to the bottom-right corner.  | Top left corner of the target element

The example below scrolls the element until different corners of the element are visible.

```js
import { Selector } from 'testcafe';

fixture `Scroll Actions`
    .page `http://www.example.com/`;

test('Scroll element into view', async t => {
    const target = Selector('#target');

    await t.scrollIntoView(target);
    // No offset, scrolls until the element's center is visible

    await t.scrollIntoView(target, { offsetX: 1, offsetY: 1 });
    // Scrolls until the top left corner of the element is visible

    await t.scrollIntoView(target, { offsetX: -1, offsetY: -1 });
    // Scrolls until the bottom right corner of the element is visible
});
```
