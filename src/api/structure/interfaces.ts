export interface Metadata {
    [key: string]: string;
}

export interface TestFile {
    collectedTests: Test[];
    currentFixture: Fixture;
}

export interface Fixture {
    name: string;
    path: string;
    testFile: TestFile;
    meta: Metadata;
    afterFn: Function | null;
    beforeFn: Function | null;
    afterEachFn: Function | null;
    beforeEachFn: Function | null;
}

export interface Test {
    only: boolean;
    name: string;
    fixture: Fixture;
    testFile: TestFile;
    meta: Metadata;
    fn: Function | null;
    afterFn: Function | null;
    beforeFn: Function | null;
}
