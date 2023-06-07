// Test Info
//----------------------------------------------------------------------------------------------------------------------

type Metadata = Record<string, string>;

interface TestInfo {
    name: string;
    meta: Metadata;
}

interface FixtureInfo {
    name: string;
    meta: Metadata;
    path: string;
}
