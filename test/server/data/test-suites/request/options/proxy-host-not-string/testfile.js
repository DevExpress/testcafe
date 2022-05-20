import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    proxy: {
        protocol: 'protocol',
        host:     1,
        port:     'port',
    },
});

test('yo', () => {
});
