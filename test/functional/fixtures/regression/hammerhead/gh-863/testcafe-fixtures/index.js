import { Selector, t, ClientFunction } from 'testcafe';

const reload = ClientFunction(() => {
    location.reload(true);
});

fixture `Fixture`
    .page(`http://localhost:${process.env.TEST_SERVER_PORT}/`);

async function assertTestElements () {
    await t
        .expect(Selector('#test-div').visible).ok()
        .expect(Selector('#loaded-script-status').textContent).eql('Loaded')
        .expect(Selector('#check-loaded-script-header-status').textContent).eql('Success')
        .expect(Selector('#loaded-image-status').textContent).eql('Loaded');
}

async function performTestActions () {
    await assertTestElements();
    await reload();
    await assertTestElements();
}

test('1', async () => {
    await performTestActions();
});

test('2', async () => {
    await performTestActions();
});

test('3', async () => {
    await performTestActions();
});
