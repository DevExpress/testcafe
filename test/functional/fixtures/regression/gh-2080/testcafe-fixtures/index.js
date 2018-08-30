import { Selector } from 'testcafe';

fixture `GH-2080 - Should find element with not-integer offset`
    .page `http://localhost:3000/fixtures/regression/gh-2080/pages/index.html`;

const result = Selector('#result');

test('click', async t => {
    await t
        .click('#child1', { offsetX: 0, offsetY: 0 })
        .click('#child2', { offsetX: 0, offsetY: 0 })
        .click('#child3', { offsetX: 0, offsetY: 0 })
        .click('#child4', { offsetX: 0, offsetY: 0 })
        .expect(result.innerText).contains('leaf1 child1 parent leaf2 child2 parent leaf3 child3 parent leaf4 child4 parent');
});
