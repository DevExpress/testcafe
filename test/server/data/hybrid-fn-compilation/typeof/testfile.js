import compileHybridFunction from '../../../../../lib/compiler/es-next/compile-hybrid-function';

fixture `Fixture`;

function compile (fn) {
    return compileHybridFunction(fn.toString());
}

test('Test', () => {
    return compile(() => {
        return function (someParam) {
            return typeof someParam;
        };
    });
});
