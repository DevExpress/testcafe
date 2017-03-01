import compileClientFunction from '../../../../../lib/compiler/es-next/compile-client-function';

fixture `Fixture`;

function compile (fn) {
    return compileClientFunction(fn.toString());
}

test('Test', () => {
    var obj = {
        fn() {
            return true;
        }
    };

    return compile(obj.fn);
});
