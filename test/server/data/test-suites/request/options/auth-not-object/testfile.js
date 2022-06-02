import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    auth: 1,
});

test('yo', () => {
});
