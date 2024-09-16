import ClassThatUsesStatic from './dep.js';

fixture('Fixture');

test('Test', async () => {
    ClassThatUsesStatic.foo;
});