import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    proxy: {
        protocol: 'protocol',
        host:     1,
        port:     'port',
    },
});

test('yo', () => {
});
