import { ClientFunction } from 'testcafe';

fixture `Test`;

ClientFunction(() => {}).with({ boundTestRun: 'yo' });

test('yo', () => {
});
