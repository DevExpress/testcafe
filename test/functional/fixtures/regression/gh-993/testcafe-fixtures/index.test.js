import { ClientFunction } from 'testcafe';

fixture `t.pressKey on angular2 element`
    .page('http://localhost:3000/fixtures/regression/gh-993/pages/index.html');

test('Press the "enter" key on the input', async t => {
    await t
        .click('#target')
        .pressKey('enter');

    const getKeySequences = ClientFunction(()=> {
        return { keydown: window.keydownSequence, keyup: window.keyupSequence };
    });

    const { keydown, keyup } = await getKeySequences();

    await t
        .expect(keydown).eql('Enter')
        .expect(keyup).eql('Enter');
});
