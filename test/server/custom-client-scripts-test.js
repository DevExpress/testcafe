const { expect }                                = require('chai');
const ClientScript                              = require('../../lib/custom-client-scripts/client-script');
const loadClientScripts                         = require('../../lib/custom-client-scripts/load');
const getCustomClientScriptURL                  = require('../../lib/custom-client-scripts/get-url');
const { RequestFilterRule }                     = require('testcafe-hammerhead');
const tmp                                       = require('tmp');
const fs                                        = require('fs');
const { setUniqueUrls, findProblematicScripts } = require('../../lib/custom-client-scripts/utils');
const { is }                                    = require('../../lib/errors/runtime/type-assertions');

describe('Client scripts', () => {
    tmp.setGracefulCleanup();

    const testScriptContent = 'var i = 3;';
    const testModuleName    = 'is-docker';
    const testBasePath      = process.cwd();

    function createScriptFile (content) {
        const file = tmp.fileSync();

        fs.writeFileSync(file.name, content || testScriptContent);

        return file;
    }

    it('Should throw the error if script initializer is not specified', () => {
        return new ClientScript().load()
            .then(() => {
                expect.fail('Should throw the error');
            })
            .catch(e => {
                expect(e.message).eql('Specify the JavaScript file path, module name or script content to inject a client script.');
            });
    });

    it('Should throw the error if scripts`s base path is not specified and path is relative', () => {
        return new ClientScript({ path: './relative-path' })
            .load()
            .then(() => {
                expect.fail('Should throw the error');
            })
            .catch(e => {
                expect(e.message).eql('Specify the base path for the client script file.');
            });
    });

    describe('Content', () => {
        it('Empty content', () => {
            const script = new ClientScript({ content: '' });

            return script
                .load()
                .then(() => {
                    expect(script.content).eql('');
                    expect(script.toString()).eql('{ content: <empty> }');
                });
        });

        it('Short content', () => {
            const script = new ClientScript({ content: testScriptContent });

            return script
                .load()
                .then(() => {
                    expect(script.content).eql(testScriptContent);
                    expect(script.url).is.not.empty;
                    expect(script.path).eql(null);
                    expect(script.toString()).eql("{ content: 'var i = 3;' }");
                });
        });

        it('Long content', () => {
            const script = new ClientScript({ content: testScriptContent.repeat(10) });

            return script
                .load()
                .then(() => {
                    expect(script.toString()).eql("{ content: 'var i = 3;var i = 3;var i =...' }");
                });
        });
    });

    describe('Load', () => {
        it('From full path', () => {
            const file   = createScriptFile();
            const script = new ClientScript({ path: file.name });

            return script
                .load()
                .then(() => {
                    expect(script.content).eql(testScriptContent);
                    expect(script.path).eql(file.name);
                    expect(script.url).contains('_');
                    expect(script.url).not.contains('/');
                    expect(script.url).not.contains('\\');
                    expect(script.toString()).eql(`{ path: '${file.name}' }`);
                });
        });

        it('Node module', () => {
            const script = new ClientScript({ module: testModuleName });

            return script.load()
                .then(() => {
                    expect(script.content).contains('hasDockerEnv() || hasDockerCGroup()');
                    expect(script.module).eql(testModuleName);
                });
        });

        it('From relative path', () => {
            const script = new ClientScript('test/server/data/custom-client-scripts/utils.js', testBasePath);

            return script.load()
                .then(() => {
                    expect(script.content).contains('function test () {');
                });
        });
    });

    describe('"Page" property', () => {
        it('Default value', () => {
            const script = new ClientScript({ content: testScriptContent });

            return script.load()
                .then(() => {
                    expect(script.page).eql(RequestFilterRule.ANY);
                });
        });

        it('Initializer', () => {
            const script = new ClientScript( {
                page:    'http://example.com',
                content: testScriptContent
            });

            return script.load()
                .then(() => {
                    expect(script.page).to.be.an.instanceOf(RequestFilterRule);
                });
        });
    });

    describe('Should throw the error if "content", "path" and "module" properties were combined', () => {
        it('"path" and "content"', () => {
            const file   = createScriptFile();
            const script = new ClientScript({ path: file.name, content: testScriptContent });

            return script.load()
                .then(() => {
                    expect.fail('Should throw the error');
                }).catch(e => {
                    expect(e.message).eql('You cannot combine the file path, module name and script content when you specify a client script to inject.');
                });
        });

        it('"path" and "module"', () => {
            const file   = createScriptFile();
            const script = new ClientScript({ path: file.name, module: testModuleName });

            return script.load()
                .then(() => {
                    expect.fail('Should throw the error');
                }).catch(e => {
                    expect(e.message).eql('You cannot combine the file path, module name and script content when you specify a client script to inject.');
                });
        });

        it('"content" and "module"', () => {
            const script = new ClientScript({ module: testModuleName, content: testScriptContent });

            return script.load()
                .then(() => {
                    expect.fail('Should throw the error');
                }).catch(e => {
                    expect(e.message).eql('You cannot combine the file path, module name and script content when you specify a client script to inject.');
                });
        });
    });

    it('Should handle IO errors', () => {
        return new ClientScript({ path: '/non-existing-file' }, testBasePath)
            .load()
            .then(() => {
                expect.fail('Should throw the error');
            })
            .catch(e => {
                expect(e.message).eql('Cannot load a client script from /non-existing-file.');
            });
    });

    it('Should correct non-unique urls', () => {
        const scripts = [
            { module: testModuleName },
            { module: testModuleName }
        ];

        return loadClientScripts(scripts, testBasePath)
            .then(setUniqueUrls)
            .then(result => {
                expect(result.length).eql(2);
                expect(result[0].url).to.not.eql(result[1].url);
            });
    });

    describe('Should provide information about problematic scripts', () => {
        describe('Duplicated content', () => {
            it('All script applied for all pages', () => {
                const scripts = [
                    { content: '1' },
                    { content: '1' },
                    { content: '2' },
                    { content: '2' },
                    { content: '3' },
                ];

                return loadClientScripts(scripts)
                    .then(findProblematicScripts)
                    .then(({ duplicatedContent }) => {
                        expect(duplicatedContent.length).eql(2);
                        expect(duplicatedContent[0].content).eql(scripts[0].content);
                        expect(duplicatedContent[1].content).eql(scripts[2].content);
                    });
            });

            it('At least script applied for all pages', () => {
                const scripts = [
                    { content: '1' },
                    { content: '1', page: 'https://example.com' },
                    { content: '2' },
                    { content: '2' },
                    { content: '3', page: 'https://example.com' },
                    { content: '3', page: 'https://example.com' },
                    { content: '4', page: 'https://example.com' },
                    { content: '4', page: 'https://another-site.com' },
                    { content: '5', page: 'https://example.com' },
                ];

                return loadClientScripts(scripts)
                    .then(findProblematicScripts)
                    .then(({ duplicatedContent }) => {
                        expect(duplicatedContent.length).eql(3);
                        expect(duplicatedContent[0].content).eql(scripts[0].content);
                        expect(duplicatedContent[1].content).eql(scripts[2].content);
                        expect(duplicatedContent[2].content).eql(scripts[4].content);
                    });
            });

            it('All scripts applied for the specified pages', () => {
                const scripts = [
                    { content: '1', page: 'https://example.com' },
                    { content: '1', page: 'https://example.com' },
                    { content: '2', page: 'https://example.com' },
                    { content: '2', page: 'https://another-site.com' },
                    { content: '3', page: 'https://example.com' },
                ];

                return loadClientScripts(scripts)
                    .then(findProblematicScripts)
                    .then(({ duplicatedContent }) => {
                        expect(duplicatedContent.length).eql(1);
                        expect(duplicatedContent[0].content).eql(scripts[0].content);
                    });
            });
        });

        it('Empty content', () => {
            const scripts = [
                { content: '' },
                { content: '123' },
                { content: '' }
            ];

            return loadClientScripts(scripts)
                .then(findProblematicScripts)
                .then(({ empty }) => {
                    expect(empty[0].content).is.empty;
                    expect(empty[1].content).is.empty;
                });
        });
    });

    it('Type assertion', () => {
        expect(is.clientScriptInitializer.predicate({})).to.be.false;
        expect(is.clientScriptInitializer.predicate(null)).to.be.false;
        expect(is.clientScriptInitializer.predicate({ path: '/path' })).to.be.true;
        expect(is.clientScriptInitializer.predicate({ content: 'var i = 0' })).to.be.true;
        expect(is.clientScriptInitializer.predicate({ module: 'module-name' })).to.be.true;
    });

    it('Get URL', () => {
        const script = new ClientScript({ content: testScriptContent });

        return script
            .load()
            .then(() => {
                expect(getCustomClientScriptURL(script)).eql('/custom-client-scripts/' + script.url);
            });
    });
});
