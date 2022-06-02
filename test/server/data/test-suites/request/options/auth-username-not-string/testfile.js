import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    auth: {
        username: 1,
        password: 'password',
    },
});

test('yo', () => {
});


