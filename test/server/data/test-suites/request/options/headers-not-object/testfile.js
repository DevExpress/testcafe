import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    headers: 1,
});

test('yo', () => {
});
