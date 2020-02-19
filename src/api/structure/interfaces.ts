import { Dictionary } from '../../configuration/interfaces';
import BaseUnit from './base-unit';


export type Metadata = Dictionary<string>;

export interface TestFile extends BaseUnit {
    collectedTests: Test[];
    currentFixture: Fixture;
}

export interface TestingUnit extends BaseUnit {
    name: string;
    only: boolean;
    testFile: TestFile;
    meta: Metadata;
}

export interface Fixture extends TestingUnit {
    path: string;
    afterFn: Function | null;
    beforeFn: Function | null;
    afterEachFn: Function | null;
    beforeEachFn: Function | null;
}

export interface Test extends TestingUnit {
    fixture: Fixture;
    fn: Function | null;
    afterFn: Function | null;
    beforeFn: Function | null;
}
