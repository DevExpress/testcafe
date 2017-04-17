import { Role } from 'testcafe';

fixture `Test`;

Role('http://example.com', () => {}, 'hey');

test('yo', () => {
});
