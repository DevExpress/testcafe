import { checkPageTestData, setPageTestData } from './helpers';

fixture.disableReloading `Default`;

test('1', () => setPageTestData());

test.enableReloading('2', t => t.expect(checkPageTestData()).notOk());
