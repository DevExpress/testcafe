import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    auth: {
        username: 1,
        password: 'password',
    },
});

test('yo', () => {
});


