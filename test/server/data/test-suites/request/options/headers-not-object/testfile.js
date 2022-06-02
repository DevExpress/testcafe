import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    headers: 1,
});

test('yo', () => {
});
