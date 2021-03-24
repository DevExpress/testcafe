Scroll action options supply additional parameters for `t.scroll`, `t.scrollBy` and `t.scrollIntoView` actions.

```js
{
    offsetX: Number,
    offsetY: Number,
}
```

Parameter                      | Type    | Description                                                                                                                                                 | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`offsetX`, `offsetY`           | Number  | Mouse pointer coordinates that define a point where the action is performed or started. If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element. If an offset is a negative integer, they are calculated relative to the bottom-right corner. | The center of the target element.

**Example**

TODO

```js
// import { Selector } from 'testcafe';

// const nameInput = Selector('#developer-name');

// fixture `My Fixture`
//     .page `http://devexpress.github.io/testcafe/example/`

// test('My Test', async t => {
//     await t
//         .typeText(nameInput, 'Pete Parker')
//         .click(nameInput, { caretPos: 4 })
//         .pressKey('r');
// });
```
