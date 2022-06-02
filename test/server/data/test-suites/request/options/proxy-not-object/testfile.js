import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    proxy: 1,
});

test('yo', () => {
});
