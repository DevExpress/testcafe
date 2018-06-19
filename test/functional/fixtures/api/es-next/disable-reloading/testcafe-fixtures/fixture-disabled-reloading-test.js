import { checkPageTestData, setPageTestData } from './helpers';

fixture.disableReloading `Default`;

test('1', () => setPageTestData());

test('2', t => t.expect(checkPageTestData()).ok());
