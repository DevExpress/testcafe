import compileClientFunction from '../../../../../lib/compiler/compile-client-function';

fixture `Fixture`;

function compile (fn) {
    return compileClientFunction(fn.toString());
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
