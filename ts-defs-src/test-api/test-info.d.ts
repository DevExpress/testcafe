// Test Info
//----------------------------------------------------------------------------------------------------------------------

interface Metadata {
    [key: string]: unknown;
}

interface TestInfo {
    name: string;
    meta: Metadata;
}

interface FixtureInfo {
    name: string;
    meta: Metadata;
    path: string;
}
