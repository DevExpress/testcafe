const PUBLISH_VERSION_RE = /^\d+\.\d+\.\d+(-alpha\.\d+)?$/;

module.exports = function getPublishTags (packageInfo) {
    const matches = packageInfo.version.match(PUBLISH_VERSION_RE);

    if (!matches)
        throw new Error('Incorrect version in package.json');

    const isAlpha = !!matches[1];

    return [packageInfo.version, isAlpha ? 'alpha' : 'latest'];
};
