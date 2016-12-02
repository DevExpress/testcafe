import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `t.pressKey on angular2 element`
    .page('http://localhost:3000/fixtures/regression/gh-993/pages/index.html');

test("Press the 'enter' key on the input", async t => {
    await t
        .click('#target')
        .pressKey('enter');

    const getKeySequences = ClientFunction(()=> {
        return { keydown: window.keydownSequence, keyup: window.keyupSequence };
    });

    const { keydown, keyup } = await getKeySequences();

    expect(keydown).equal('Enter');
    expect(keyup).equal('Enter');
});
