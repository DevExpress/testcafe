import { Selector } from 'testcafe';

fixture `Test`;

Selector(() => {}).withAttr(/class/, -100);

test('yo', () => {
});
