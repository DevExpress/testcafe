```js
import { Selector } from 'testcafe';

fixture `Scroll Actions`
    .page `http://www.example.com/`;

test('Scroll element into view', async t => {
    const target = Selector('#target');

    await t
        .scrollIntoView(target);
});
```