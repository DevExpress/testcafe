import { Role } from 'testcafe';

const roleWithRoleSwitch = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html', async t => {
    await t.useRole(Role.anonymous());
});


fixture `Errors`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/index.html`;

test('Role switch in initializer', async t => {
    await t.useRole(roleWithRoleSwitch);
});

test('useRole argument', async t => {
    await t.useRole({});
});

test('Error restoring configuration', async t => {
    await t.eval(() => {
        var iframe = document.createElement('iframe');

        iframe.id = 'new-iframe';
        document.body.appendChild(iframe);
    });

    await t
        .switchToIframe('#new-iframe')
        .useRole(Role.anonymous());
});
