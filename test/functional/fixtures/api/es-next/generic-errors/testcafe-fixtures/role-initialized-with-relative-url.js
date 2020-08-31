import { Role } from 'testcafe';

fixture `Role is initialized with relative url`;

const erroredRole = Role('./relative-url', async t => {
    await t.maximizeWindow();
});

test('test', async t => {
    await t.useRole(erroredRole);
});
