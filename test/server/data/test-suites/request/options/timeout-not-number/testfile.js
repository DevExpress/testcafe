import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    timeout: 'one',
});

test('yo', () => {
});
