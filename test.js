import { Selector } from 'testcafe';

fixture `1`;

test(`1`, async t => {
    debugger;

    console.log(await Selector('body')());

    console.log(42);
});
