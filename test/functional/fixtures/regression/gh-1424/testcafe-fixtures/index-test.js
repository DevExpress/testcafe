import { Selector, ClientFunction } from 'testcafe';

fixture `gh-1424`
    .page `http://localhost:3000/fixtures/regression/gh-1424/pages/index.html`;

test('Press enter', async t => {
    const btn   = Selector('#btn');
    const input = Selector('#input');

    /* eslint-disable no-undef */
    const focus = ClientFunction(() => el().focus());
    /* eslint-enable no-undef */

    await focus.with({ dependencies: { el: btn } })();
    await t.pressKey('enter');
    await focus.with({ dependencies: { el: input } })();
    await t.pressKey('enter');

    const events = await t.eval(() => {
        return [window.btnKeyPressCount, window.btnClickCount, window.inputKeyPressCount, window.inputClickCount].join(',');
    });

    await t.expect(events).eql('1,1,1,1');
});
