import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    rawResponse: 'one',
});

test('yo', () => {
});
