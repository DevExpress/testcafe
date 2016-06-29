// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { expect } from 'chai';

fixture `Click`
    .page `http://localhost:3000/fixtures/regression/gh-628/pages/index.html`;

test('Click on an "option" element', async t => {
    await t
        .click('#simple-select')
        .click('[value=Second]');

    var select = await t.select('#simple-select');

    expect(select.value).eql('Second');
});

test('Click on an invisible "option" element', async t => {
    await t
        .click('[value=Second]');
});
