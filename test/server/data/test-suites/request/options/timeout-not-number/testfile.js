import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    timeout: 'one',
});

test('yo', () => {
});
