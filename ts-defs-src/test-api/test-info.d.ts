// Test Info
//----------------------------------------------------------------------------------------------------------------------

type Metadata = Record<string, unknown>;

interface TestInfo {
    name: string;
    meta: Metadata;
}

interface FixtureInfo {
    name: string;
    meta: Metadata;
    path: string;
}
