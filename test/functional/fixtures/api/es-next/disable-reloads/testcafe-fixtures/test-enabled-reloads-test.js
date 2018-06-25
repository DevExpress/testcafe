import { checkPageTestData, setPageTestData } from './helpers';

fixture.disablePageReloads `Default`;

test('1', () => setPageTestData());

test.enablePageReloads('2', t => t.expect(checkPageTestData()).notOk());
