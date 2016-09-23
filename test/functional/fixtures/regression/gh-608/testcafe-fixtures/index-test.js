import { expect } from 'chai';
import { ClientFunction } from 'testcafe';


fixture `GH-608`
    .page `http://localhost:3000/fixtures/regression/gh-608/pages/index.html`;


const getDate = ClientFunction(() => Date.now());


test('click on a fake link', async t => {
    const maxActionDelay = 5000;

    const startTime = await getDate();

    await t.click('#fakeLink');

    const stopTime = await getDate();

    expect(stopTime - startTime).to.be.below(maxActionDelay);
});
