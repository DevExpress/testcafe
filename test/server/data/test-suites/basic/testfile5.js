import ClassThatUsesStatic from './dep3.js';

fixture('Fixture6');

test('Fixture6Test1', async () => {
    ClassThatUsesStatic.foo;
});
