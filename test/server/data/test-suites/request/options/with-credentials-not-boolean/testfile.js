import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    withCredentials: 'one',
});

test('yo', () => {
});
