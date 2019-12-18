import { Role, Selector, ClientFunction } from 'testcafe';

const page = 'http://localhost:3000/fixtures/reporter/pages/index.html';

fixture `Reporter`
    .page `http://localhost:3000/fixtures/reporter/pages/index.html`;

const simpleRole1 = Role(page, () => {
}, { preserveUrl: true });

const complexRole = Role(page, async t => {
    await t.click('#target');
});

const errorRole = Role(page, async t => {
    await t.click(Selector('#non-existing-element'), { timeout: 100 });
});

const foo = ClientFunction(bool => () => bool);

test('Simple test', async t => {
    await t.wait(1);
});

test('Simple command test', async t => {
    await t.click(Selector('#target'));
});

test('Simple command err test', async t => {
    await t.click('#non-existing-target');
});

test('Complex command test', async t => {
    await t.useRole(simpleRole1);
});

test('Complex nested command test', async t => {
    await t.useRole(complexRole);
});

test('Complex nested command error', async t => {
    await t.useRole(errorRole);
});

test('Simple assertion', async t => {
    await t.expect(true).eql(true, 'assertion message', { timeout: 100 });
});

test('Selector assertion', async t => {
    await t.expect(Selector('#target').innerText).eql('target');
});

test('Snapshot', async () => {
    await Selector('#target')();

    await Selector('body').find('#target').innerText;
});

test('Client Function', async () => {
    await foo(1, true);
});

test('Eval', async t => {
    await t.eval(() => document.getElementById('#target'));
});
