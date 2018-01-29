import { Role } from 'testcafe';

let initialized = false;

const userRole = Role('http://localhost:3000/fixtures/regression/gh-2015/pages/logon.html', async t => {
    if (initialized)
        throw new Error('Role is already initialized');

    initialized = true;

    await t
        .click('#setAuthToken')
        .click('#redirectAfterLogin');
}, { preserveUrl: true });

export default userRole;
