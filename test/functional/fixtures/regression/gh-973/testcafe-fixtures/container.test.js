import { Selector } from 'testcafe';
import { expect } from 'chai';


fixture `Scroll div container`
    .page `http://localhost:3000/fixtures/regression/gh-973/pages/container.html`;


const targetLowerRightSelector      = Selector(() => document.querySelector('#targetLowerRight'));
const targetUpperLeftSelector       = Selector(() => document.querySelector('#targetUpperLeft'));
const targetLowerRightSmallSelector = Selector(() => document.querySelector('#targetLowerRightSmall'));
const targetUpperLeftSmallSelector  = Selector(() => document.querySelector('#targetUpperLeftSmall'));

test('Scroll container to the lower right corner element', async t => {
    await t.click(targetLowerRightSelector, { offsetX: 200, offsetY: 200 });

    const targetLowerRightSnapshot = await targetLowerRightSelector();
    const parentSnapshot           = await targetLowerRightSnapshot.getParentNode();

    const rightIndent  = parentSnapshot.getBoundingClientRectProperty('right') -
                         targetLowerRightSnapshot.getBoundingClientRectProperty('right');
    const bottomIndent = parentSnapshot.getBoundingClientRectProperty('bottom') -
                         targetLowerRightSnapshot.getBoundingClientRectProperty('bottom');

    expect(rightIndent).to.be.above(0);
    expect(bottomIndent).to.be.above(0);
});

test('Scroll container to the upper left corner element', async t => {
    await t
        .click(targetLowerRightSelector)
        .click(targetUpperLeftSelector, { offsetX: 0, offsetY: 0 });

    const targetUpperLeftSnapshot = await targetUpperLeftSelector();
    const parentSnapshot          = await targetUpperLeftSnapshot.getParentNode();

    const leftIndent = targetUpperLeftSnapshot.getBoundingClientRectProperty('left') -
                       parentSnapshot.getBoundingClientRectProperty('left');
    const topIndent  = targetUpperLeftSnapshot.getBoundingClientRectProperty('top') -
                       parentSnapshot.getBoundingClientRectProperty('top');

    expect(leftIndent).to.be.above(0);
    expect(topIndent).to.be.above(0);
});

test('Scroll small container to the lower right corner element', async t => {
    await t.click(targetLowerRightSmallSelector, { offsetX: 100, offsetY: 100 });

    const targetLowerRightSmallSnapshot = await targetLowerRightSmallSelector();
    const parentSnapshot                = await targetLowerRightSmallSnapshot.getParentNode();

    const rightIndent  = parentSnapshot.getBoundingClientRectProperty('right') -
                         targetLowerRightSmallSnapshot.getBoundingClientRectProperty('right');
    const bottomIndent = parentSnapshot.getBoundingClientRectProperty('bottom') -
                         targetLowerRightSmallSnapshot.getBoundingClientRectProperty('bottom');

    expect(rightIndent).to.be.above(0).and.to.be.most(10);
    expect(bottomIndent).to.be.above(0).and.to.be.most(10);
});

test('Scroll small container to the upper left corner element', async t => {
    await t
        .click(targetLowerRightSmallSelector)
        .click(targetUpperLeftSmallSelector, { offsetX: 0, offsetY: 0 });

    const targetUpperLeftSmallSnapshot = await targetUpperLeftSmallSelector();
    const parentSnapshot               = await targetUpperLeftSmallSnapshot.getParentNode();

    const leftIndent = targetUpperLeftSmallSnapshot.getBoundingClientRectProperty('left') -
                       parentSnapshot.getBoundingClientRectProperty('left');
    const topIndent  = targetUpperLeftSmallSnapshot.getBoundingClientRectProperty('top') -
                       parentSnapshot.getBoundingClientRectProperty('top');

    expect(leftIndent).to.be.above(0).and.to.be.most(10);
    expect(topIndent).to.be.above(0).and.to.be.most(10);
});
