import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    proxy: {
        protocol: 'protocol',
        host:     'host',
        port:     true,
    },
});

test('yo', () => {
});
