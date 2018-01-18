import { Selector } from 'testcafe';

fixture `Should restore local storage correctly on UseRole with PreserveUrl`;

import userRole from './role';

test('Should log in with role navigation', async t => {
    await t.useRole(userRole);
    await t.expect(Selector('#result').textContent).eql('logged');
});

test('Should restore logged state without page navigation', async t => {
    await t.useRole(userRole);
    await t.expect(Selector('#result').textContent).eql('logged');
});
