import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    maxRedirects: 'one',
});

test('yo', () => {
});
