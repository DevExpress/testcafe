import { Role } from 'testcafe';

fixture `Test`;

Role('http://example.com', () => {}, { preserveUrl: [] });

test('yo', () => {
});
