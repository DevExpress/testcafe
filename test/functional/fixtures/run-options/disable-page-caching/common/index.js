import {
    ClientFunction,
    Role,
    Selector,
    t
} from 'testcafe';

const getPageLocation = ClientFunction(() => window.location.toString());

const url = 'http://localhost:3000/fixtures/run-options/disable-page-caching/pages/index.html';

const expectedRoleLastPageLocation = 'http://localhost:3000/fixtures/run-options/disable-page-caching/pages/third.html';

const role = Role(url, async () => {
    await t
        .click(Selector('#first'))
        .click(Selector('#second'))
        .click(Selector('#third'));

    role.lastPageLocation = await getPageLocation();
});

export {
    role,
    url,
    expectedRoleLastPageLocation
};

