import { Selector, ClientFunction } from 'testcafe';

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

test('drag', async t => {
    await t
        .drag('#drag', 50, 50, { offsetX: 0, offsetY: 0 })
        .drag('#drag', 70, 70, { offsetX: 0, offsetY: 0 })
        .drag('#drag', 90, 90, { offsetX: 0, offsetY: 0 })
        .drag('#drag', 110, 110, { offsetX: 0, offsetY: 0 })
        .expect(result.innerText).contains('leaf1 child1 parent leaf2 child2 parent leaf3 child3 parent leaf4 child4 parent');
});

const appendMouseOver = ClientFunction(() => {
    var leaves = document.querySelectorAll('.leaf');

    for (var i = 0; i < leaves.length; i++)
        leaves[i].addEventListener('mouseover', window.log);
});

test('hover', async t => {
    await appendMouseOver();

    await t
        .hover('#leaf1', { offsetX: 20, offsetY: 20 })
        .expect(result.innerText).contains('leaf2')
        .hover('#leaf2', { offsetX: 20, offsetY: 20 })
        .expect(result.innerText).contains('leaf3')
        .hover('#leaf3', { offsetX: 20, offsetY: 20 })
        .expect(result.innerText).contains('leaf4');
});
