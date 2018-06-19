import { checkPageTestData, setPageTestData } from './helpers';

fixture `Default`;

test('1', () => setPageTestData());

test.disableReloading('2', t => t.expect(checkPageTestData()).ok());
