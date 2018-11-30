import { isMatch } from 'lodash';

export default function (opts) {
    return (testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
        if (opts.test && testName !== opts.test)
            return false;

        if (opts.testGrep && !opts.testGrep.test(testName))
            return false;

        if (opts.fixture && fixtureName !== opts.fixture)
            return false;

        if (opts.fixtureGrep && !opts.fixtureGrep.test(fixtureName))
            return false;

        if (opts.testMeta && !isMatch(testMeta, opts.testMeta))
            return false;

        if (opts.fixtureMeta && !isMatch(fixtureMeta, opts.fixtureMeta))
            return false;

        return true;
    };
}
