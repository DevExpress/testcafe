import { Selector } from 'testcafe';

fixture `GH-2056`
    .page `http://localhost:3000/fixtures/regression/gh-2056/pages/index.html`;

const el1    = Selector('#el1');
const el2    = Selector('#el2');
const el3    = Selector('#el3');
const result = Selector('#result');

async function checkMoveEventProperties (t, expected) {
    await t
        .setTestSpeed(0.1)
        .click(el1)
        .hover(el3)
        .click(el2)
        .dragToElement(el2, el3)
        .expect(result.innerText).eql(expected);
}

test('Chrome', async t => {
    await checkMoveEventProperties(t, 'onMove:000onMoveWithLeftButtonPressed:011');
});

test('IE, FF, Edge', async t => {
    await checkMoveEventProperties(t, 'onMove:001onMoveWithLeftButtonPressed:011');
});
