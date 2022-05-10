import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    auth: {
        username: 'username',
        password: 1,
    },
});

test('yo', () => {
});
