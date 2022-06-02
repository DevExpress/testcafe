import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    params: 1,
});

test('yo', () => {
});
