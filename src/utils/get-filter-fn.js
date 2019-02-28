import { isMatch, pick } from 'lodash';

const FILTERING_OPTIONS = {
    testGrep:    'testGrep',
    fixtureGrep: 'fixtureGrep',
    testMeta:    'testMeta',
    fixtureMeta: 'fixtureMeta',
    test:        'test',
    fixture:     'fixture'
};

function isAllFilteringOptionsAreUndefined (opts) {
    return Object
        .keys(FILTERING_OPTIONS)
        .every(option => opts[option] === void 0);
}

function createFilterFn (opts) {
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

export default function (opts) {
    const filteringOpts = pick(opts, Object.keys(FILTERING_OPTIONS));

    if (isAllFilteringOptionsAreUndefined(filteringOpts))
        return void 0;

    return Object.assign(createFilterFn(filteringOpts), filteringOpts);
}
