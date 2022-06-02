import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    proxy: {
        protocol: 'protocol',
        host:     'host',
        port:     true,
    },
});

test('yo', () => {
});
