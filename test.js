import { Role, ClientFunction, Selector } from 'testcafe';

fixture `Test authentication`
    .page `http://localhost:4100/`;

const role = Role(`http://localhost:4100/#login`, async t => await t.click('input'), { preserveUrl: true });
const reloadPage = new ClientFunction(() => location.reload(true));
const fixedUseRole = async (t, role) => {
	await t.useRole(role);
	await reloadPage();
};

test('first login', async t => {
    await t
        .wait(3000)
        .useRole(role)
        .expect(Selector('h1').innerText).eql('Authorized');
});

test('second login', async t => {
    await t
        .wait(3000)
        .useRole(role)
        .expect(Selector('h1').innerText).eql('Authorized');
});
