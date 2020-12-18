import { ClientFunction } from 'testcafe';

fixture `Custom user profile`;

const checkIsEqual = ClientFunction(() => 42 === 42);

test('Test', async t => {
    await t.expect(checkIsEqual).ok();
});

test('Screenshots', async t => {
    await t.takeScreenshot('1.png');
});

test('Resizing', async t => {
    await t.resizeWindow(500, 500);
});
