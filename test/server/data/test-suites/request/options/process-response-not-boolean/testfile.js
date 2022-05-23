import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    rawResponse: 'one',
});

test('yo', () => {
});
