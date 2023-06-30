/// <reference path="../../../../../ts-defs/index.d.ts" />
import { version } from 'testcafe';

fixture `Version`;

test('test', async (t) => {
    await t
        .expect(!!version).ok();
});
