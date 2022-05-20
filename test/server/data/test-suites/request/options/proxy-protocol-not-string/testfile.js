import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    proxy: {
        protocol: 1,
        host:     'host',
        port:     'port',
    },
});

test('yo', () => {
});
