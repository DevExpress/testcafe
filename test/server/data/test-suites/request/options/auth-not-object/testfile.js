import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    auth: 1,
});

test('yo', () => {
});
