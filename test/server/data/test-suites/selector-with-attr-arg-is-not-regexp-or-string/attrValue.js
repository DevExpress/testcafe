import { Selector } from 'testcafe';

fixture `Test`;

Selector(() => {}).withAttribute(/class/, -100);

test('yo', () => {
});
