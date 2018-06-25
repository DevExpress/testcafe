import { checkPageTestData, setPageTestData } from './helpers';

fixture.enablePageReloads `Default`;

test('1', () => setPageTestData());

test.disablePageReloads('2', t => t.expect(checkPageTestData()).ok());
