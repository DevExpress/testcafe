import compileHybridFunction from '../../../../../lib/compiler/es-next/compile-hybrid-function';

fixture `Fixture`;

function compile (fn) {
    return compileHybridFunction(fn.toString());
}

test('Test', () => {
    return compile(() => {
        return typeof someObj;
    });
});
