import { Selector } from 'testcafe';

fixture `Global`;

test('Global', async t => {
    await t
        .navigateTo('http://dummy-url.com')
        .expect(Selector('h1').textContent).eql('Mocked page')
        .click('button')
        .expect(Selector('h2').textContent).eql('Data from mocked fetch request')
        .navigateTo('https://another-dummy-url.com')
        .expect(Selector('body').exists).ok();
});
