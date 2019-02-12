const expect                  = require('chai').expect;
const parseBrowsersAndSources = require('../../lib/cli/correct-browsers-and-sources');

class ConfigurationMock {
    constructor (opts) {
        this.mergeOptions(opts);
    }

    mergeOptions (opts) {
        Object.keys(opts).forEach(key => {
            this[key] = opts[key];
        });
    }

    getOption (name) {
        return this[name];
    }
}

class ArgsMock {
    constructor (args) {
        this.args     = args;
        this.browsers = args[0].split(',');
        this.src      = args.slice(1);
    }
}
describe('CLI Correct browsers and sources', () => {
    it('Should allow to skip browser in CLI if they are specified in the config', () => {
        const configuration = new ConfigurationMock({
            browsers: ['chrome'],
        });

        const args = new ArgsMock([
            'test1.js',
            'test2.js'
        ]);

        return parseBrowsersAndSources(args, configuration)
            .then(([browsers, sources]) => {
                expect(browsers).to.be.empty;
                expect(sources).to.be.deep.equal(['test1.js', 'test2.js']);
            });
    });

    it('Should override browsers in the config with valid browsers from CLI', () => {
        const configuration = new ConfigurationMock({
            browsers: ['some-browser']
        });

        const args = new ArgsMock([
            'firefox,chrome',
            'test1.js'
        ]);

        return parseBrowsersAndSources(args, configuration)
            .then(([browsers, sources]) => {
                expect(browsers).to.be.deep.equal(['firefox', 'chrome']);
                expect(sources).to.be.deep.equal(['test1.js']);
            });
    });

    it('Should not correct browsers and sources from CLI if browsers are not specified in the config', () => {
        const configuration = new ConfigurationMock({
            browsers: []
        });

        const args = new ArgsMock([
            'foo-test.js',
            'bar-test.js'
        ]);

        return parseBrowsersAndSources(args, configuration)
            .then(([browsers, sources]) => {
                expect(browsers).to.be.deep.equal(['foo-test.js']);
                expect(sources).to.be.deep.equal(['bar-test.js']);
            });
    });

    it('Should not override test files from the config with a valid CLI contains commas', () => {
        const configuration = new ConfigurationMock({
            browsers: ['chrome']
        });

        const args = new ArgsMock([
            '[e2e,admin]user-manager-test.js',
            '[e2e,store]basket-page-test.js'
        ]);

        return parseBrowsersAndSources(args, configuration)
            .then(([browsers, sources]) => {
                expect(browsers).to.be.deep.equal([]);
                expect(sources).to.be.deep.equal(['[e2e,admin]user-manager-test.js', '[e2e,store]basket-page-test.js']);
            });
    });


    it('Should throw an error if browsers from the config are overridden with valid & invalid browsers from CLI', () => {
        const configuration = new ConfigurationMock({
            browsers: ['chrome']
        });

        const args = new ArgsMock([
            'firefox,foo,bar',
            'test1.js'
        ]);

        return parseBrowsersAndSources(args, configuration)
            .then(() => {
                throw new Error('Promise rejection expected');
            })
            .catch(error => {
                expect(error.message).to.contain('foo');
                expect(error.message).to.contain('bar');
            });
    });
});
