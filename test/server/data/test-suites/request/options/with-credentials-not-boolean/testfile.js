import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    withCredentials: 'one',
});

test('yo', () => {
});
