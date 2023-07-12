export default function getTestCafeVersion (): string {
    return require('../../package.json').version;
}
