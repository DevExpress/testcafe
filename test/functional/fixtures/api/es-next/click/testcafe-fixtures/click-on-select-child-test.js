// NOTE: to preserve callsites, add new tests AFTER the existing ones

import { Selector } from 'testcafe';

fixture `Click`
    .page `http://localhost:3000/fixtures/api/es-next/click/pages/select.html`;

test('Click on an "option" element', async t => {
    await t
        .click('#simple-select')
        .click('[value=Second]')
        .expect(Selector('#simple-select').value).eql('Second');
});

test('Click on an invisible "option" element', async t => {
    await t
        .click('[value=Second]');
});
