import { Selector } from 'testcafe';

fixture `1`;

test(`1`, async t => {
    debugger;

    await Selector('body')();

    console.log(42);
});
