import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    proxy: 1,
});

test('yo', () => {
});
