import compileClientFunction from '../../../../../lib/compiler/es-next/compile-client-function';

fixture `Fixture`;

function compile (fn) {
    return compileClientFunction(fn.toString());
}

test('Test', () => {
    return compile(() => {
        return Object.keys(SomeClass.prototype).forEach(prop => prop);
    });
});
