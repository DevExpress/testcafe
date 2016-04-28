import compileHybridFunction from '../../../../../lib/compiler/es-next/compile-hybrid-function';

fixture `Fixture`;

function compile (fn) {
    return compileHybridFunction(fn.toString());
}

test('Test', () => {
    return compile(() => {
        var a = new Promise((resolve, reject) => {
            reject(1);
        });

        return Promise
            .resolve()
            .then(()=> a)
            .catch(err => err);
    });
});
