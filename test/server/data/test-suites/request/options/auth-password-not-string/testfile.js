import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    auth: {
        username: 'username',
        password: 1,
    },
});

test('yo', () => {
});
