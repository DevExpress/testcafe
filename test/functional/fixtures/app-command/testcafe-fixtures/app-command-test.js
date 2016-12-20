import { Selector } from 'testcafe';

fixture `App command`;

test('Wait', async t => {
    await t
        .navigateTo('http://localhost:3025/')
        .wait(1500);
});

test('Click div', async t => {
    await t
        .navigateTo('http://localhost:3026/')
        .click('#someDiv');
});

test('Test changed', async t => {
    await t
        .navigateTo('http://localhost:3027/')
        .expect(Selector('#result').textContent).eql('Changed');
});
