import semver from 'semver';

const INTERNAL_MODULES_PREFIX = semver.gte(process.version, '15.0.0') ? 'node:' : 'internal/';

export default INTERNAL_MODULES_PREFIX;
