import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    processResponse: 'one',
});

test('yo', () => {
});
