import { fixture, request } from 'testcafe';

fixture `Test`;

request('http://localhost', {
    isAjax: 'one',
});

test('yo', () => {
});
