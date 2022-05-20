import { fixture, Request } from 'testcafe';

fixture `Test`;

Request('http://localhost', {
    isAjax: 'one',
});

test('yo', () => {
});
