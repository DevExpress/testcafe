import { Selector } from 'testcafe';

fixture `Element waiting`;

let i = 10;

while (i--)
    test.page('http://localhost:8080')('Test', async t => {
        await t
            .click(Selector('span').withText('Edit in Designer'))
            .click('.dx-dashboard-designer-menu-button')
            .click(Selector('li').withText('Data Sources'));
        await t.eval(() => window.addEventListener('click', e => console.log('click', e.target), true));
        await t.click(Selector('.dx-dashboard-datasource-list-action').withText('Add'))
            .click(Selector('span').withText('Cancel'))
            .click(Selector('.dx-dashboard-datasource-list-action').withText('Add'));
    });