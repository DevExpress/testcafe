import { checkPageTestData, setPageTestData } from './helpers.js';

fixture `Default`;

test('1', () => setPageTestData());

test('2', t => t.expect(checkPageTestData()).notOk());
