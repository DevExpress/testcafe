import func from './esm-package.mjs';

fixture `Runner`;

test(`Basic test`, async t => {
    await t.expect(func()).ok();
});
