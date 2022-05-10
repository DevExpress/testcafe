import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    method: 1,
});

test('yo', () => {
});
