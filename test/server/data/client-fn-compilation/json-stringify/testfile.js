import compileClientFunction from '../../../../../lib/compiler/compile-client-function';

fixture `Fixture`;

function compile (fn) {
    return compileClientFunction(fn.toString());
}

test('Test', () => {
    return compile(() => {
        const str = JSON.stringify(someObj);

        return JSON.parse(someStr + str);
    });
});
