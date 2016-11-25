import { Selector } from 'testcafe';
import { expect } from 'chai';


fixture `Scroll a div container`
    .page `http://localhost:3000/fixtures/regression/gh-987/pages/index.html`;


const horizontalContainer = Selector('#horizontalContainer');
const verticalContainer   = Selector('#verticalContainer');

test('Scroll the vertical container to the bottom element', async t => {
    await t.click('#targetBottom');

    expect(await verticalContainer.scrollTop).to.be.least(8);
});

test('Scroll the vertical container to the top element', async t => {
    await t.eval(() => {
        document.querySelector('#verticalContainer').scrollTop = 8;
    });

    await t.click('#targetTop');

    expect(await verticalContainer.scrollTop).eql(0);
});

test('Scroll the horizontal container to the left element', async t => {
    await t.eval(() => {
        document.querySelector('#horizontalContainer').scrollLeft = 8;
    });

    await t.click('#targetLeft');

    expect(await horizontalContainer.scrollLeft).eql(0);
});

test('Scroll the horizontal container to the right element', async t => {
    await t.click('#targetRight');

    expect(await horizontalContainer.scrollLeft).to.be.least(3);
});
