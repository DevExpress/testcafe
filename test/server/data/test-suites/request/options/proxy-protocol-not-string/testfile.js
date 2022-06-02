import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    proxy: {
        protocol: 1,
        host:     'host',
        port:     'port',
    },
});

test('yo', () => {
});
