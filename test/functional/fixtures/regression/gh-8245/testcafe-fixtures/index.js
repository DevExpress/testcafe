import ClassThatUsesStatic from './lib.js';

fixture('GH-8245 - Should run test with static class blocks');

test('Click on a split link', async () => {
    ClassThatUsesStatic.foo;
});
