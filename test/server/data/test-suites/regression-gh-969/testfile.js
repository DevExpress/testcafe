import { expect } from 'chai';
import * as app from './helpers/module.js';

fixture('Export Issue');

test('re-export', async() => {
    expect(app.FOO).to.eql(42);
});