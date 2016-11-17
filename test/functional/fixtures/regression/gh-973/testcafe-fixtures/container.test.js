import { Selector } from 'testcafe';
import { expect } from 'chai';


fixture `Scroll div container`
    .page `http://localhost:3000/fixtures/regression/gh-973/pages/container.html`;


const targetLowerRightSelector = Selector(() => document.querySelector('#targetLowerRight'));
const targetUpperLeftSelector  = Selector(() => document.querySelector('#targetUpperLeft'));

test('Scroll to lower right corner element', async t => {
    await t.click('#targetLowerRight', { offsetX: 500, offsetY: 500 });

    const targetLowerRightSnapshot = await targetLowerRightSelector();
    const parentSnapshot           = await targetLowerRightSnapshot.getParentNode();

    const rightIndent  = parentSnapshot.getBoundingClientRectProperty('right') -
                         targetLowerRightSnapshot.getBoundingClientRectProperty('right');
    const bottomIndent = parentSnapshot.getBoundingClientRectProperty('bottom') -
                         targetLowerRightSnapshot.getBoundingClientRectProperty('bottom');

    expect(rightIndent).to.be.above(0);
    expect(bottomIndent).to.be.above(0);
});

test('Scroll to upper left corner element', async t => {
    await t
        .click('#targetLowerRight')
        .click('#targetUpperLeft', { offsetX: 0, offsetY: 0 });

    const targetUpperLeftSnapshot = await targetUpperLeftSelector();
    const parentSnapshot          = await targetUpperLeftSnapshot.getParentNode();

    const leftIndent = targetUpperLeftSnapshot.getBoundingClientRectProperty('left') -
                       parentSnapshot.getBoundingClientRectProperty('left');
    const topIndent  = targetUpperLeftSnapshot.getBoundingClientRectProperty('top') -
                       parentSnapshot.getBoundingClientRectProperty('top');

    expect(leftIndent).to.be.above(0);
    expect(topIndent).to.be.above(0);
});
