import { Selector } from 'testcafe';

fixture `Element waiting`;

test.page('https://demos.devexpress.com/Dashboard')('Test', async t => {
    await t
        .click(Selector('span').withText('Edit in Designer'))
        .click('.dx-dashboard-designer-menu-button')
        .click(Selector('li').withText('Data Sources'))
        .click(Selector('.dx-dashboard-datasource-list-action').withText('Add'))
        .click(Selector('span').withText('Cancel'))
        .click(Selector('.dx-dashboard-datasource-list-action').withText('Add'));
});
