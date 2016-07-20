import { APIError } from '../../../../../lib/errors/runtime';

fixture `Test`
    .page `http://example.com`;

var obj = {
    method1: () => {
        throw new APIError('method1');
    },

    method2: () => {
        return obj;
    }
};

test('test', async () => {
    await obj
        .method2()
        .method1()
        .method2();

    const actual = true;
});
