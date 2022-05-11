import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    method: 'TEST',
});

test('yo', () => {
});
