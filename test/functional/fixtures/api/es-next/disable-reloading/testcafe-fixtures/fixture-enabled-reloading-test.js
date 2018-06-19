import { checkPageTestData, setPageTestData } from './helpers';

fixture.enableReloading `Default`;

test('1', () => setPageTestData());

test('2', t => t.expect(checkPageTestData()).notOk());
