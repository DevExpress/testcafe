import { Role } from 'testcafe';

fixture `Reporter`
    .page `http://localhost:3000/fixtures/reporter/pages/index.html`;

const simpleRole1  = Role('http://example.com', () => {});

const complexRole = Role('http://localhost:3000/fixtures/reporter/pages/index.html?test=3', async t => {
    await t.click('h1');
});

test('Simple test', async t => {
    await t.wait(1);
});

test('Simple command test', async t => {
    await t.click('#target');
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

test('Complex command sequence', async t => {
    await t
        .useRole(Role('http://example.com', () => {}))
        .useRole(Role('http://ya.ru', () => {}));
});
