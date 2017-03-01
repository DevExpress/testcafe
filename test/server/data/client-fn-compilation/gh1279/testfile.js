import compileClientFunction from '../../../../../lib/compiler/es-next/compile-client-function';

fixture `Fixture`;

function compile (fn) {
    return compileClientFunction(fn.toString());
}

test('Test', () => {
    var obj = {
        fn_123$$() {
            return true;
        }
    };

    return compile(obj.fn_123$$);
});
