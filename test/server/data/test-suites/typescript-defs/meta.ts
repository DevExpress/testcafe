/// <reference path="../../../../../ts-defs/index.d.ts" />
import { ClientFunction } from 'testcafe';

fixture ('Fixture with metadata')
    .meta('fixtureID', 'f-0001')
    .meta({ author: 'John', creationDate: '05/03/2018' });

test
    .meta('testID', 't-0005')
    .meta({ severity: 'critical', testedAPIVersion: '1.0' })
    ('MyTest', async t => { /* ... */});

