import { compileClientFunction } from '../../../../../lib/compiler/es-next/client-functions';

fixture `Fixture`;

function compile (fn) {
    return compileClientFunction(fn.toString());
}

test('Test', () => {
    return compile(() => {
        const { hostname, port } = window.location;

        return `${hostname}:${port}`;
    });
});
