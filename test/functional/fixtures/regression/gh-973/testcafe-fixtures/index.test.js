import { Selector, ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `Scroll document body`
    .page `http://localhost:3000/fixtures/regression/gh-973/pages/index.html`;


const targetLowerRightSelector = Selector(() => document.querySelector('#targetLowerRight'));
const targetUpperLeftSelector  = Selector(() => document.querySelector('#targetUpperLeft'));
const documentSelector         = Selector(() => document.documentElement);

const getWindowSize = ClientFunction(()=> {
    return { height: window.innerHeight, width: window.innerWidth };
});

test('Scroll to the lower right corner element', async t => {
    await t.click(targetLowerRightSelector, { offsetX: 500, offsetY: 500 });

    const documentSnapshot         = await documentSelector();
    const targetLowerRightSnapshot = await targetLowerRightSelector();

    const rightIndent  = documentSnapshot.clientWidth - targetLowerRightSnapshot.getBoundingClientRectProperty('right');
    const bottomIndent = documentSnapshot.clientHeight -
                         targetLowerRightSnapshot.getBoundingClientRectProperty('bottom');

    expect(rightIndent).to.be.above(0);
    expect(bottomIndent).to.be.above(0);
});

test('Scroll to the upper left corner element', async t => {
    await t
        .click(targetLowerRightSelector)
        .click(targetUpperLeftSelector, { offsetX: 0, offsetY: 0 });

    const targetUpperLeftSnapshot = await targetUpperLeftSelector();

    const leftIndent = targetUpperLeftSnapshot.getBoundingClientRectProperty('left');
    const topIndent  = targetUpperLeftSnapshot.getBoundingClientRectProperty('top');

    expect(leftIndent).to.be.above(0);
    expect(topIndent).to.be.above(0);
});

test('Scroll to the lower right corner element (mobile)', async t => {
    await t.click(targetLowerRightSelector, { offsetX: 499, offsetY: 499 });

    const documentSnapshot         = await getWindowSize();
    const targetLowerRightSnapshot = await targetLowerRightSelector();

    const rightIndent  = documentSnapshot.width - targetLowerRightSnapshot.getBoundingClientRectProperty('right');
    const bottomIndent = documentSnapshot.height - targetLowerRightSnapshot.getBoundingClientRectProperty('bottom');

    expect(rightIndent).to.be.above(0);
    expect(bottomIndent).to.be.above(0);
});
