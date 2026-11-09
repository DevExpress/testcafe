const { expect }          = require('chai');
const fs                  = require('fs');
const { pathToFileURL }    = require('url');
const createCallsiteRecord = require('../../lib/utils/callsite-record');
const getRenderers         = require('../../lib/utils/get-renderes');
const { getCallsiteForMethod } = require('../../lib/errors/get-callsite');

const filename = require.resolve('./data/callsite-record/source');
const renderers = createCallsiteRecord.renderers;

function createError (location = filename) {
    const error = new Error('test');

    error.stack = `Error: test\n    at example (${location}:2:7)`;

    return error;
}

describe('Local callsite record', () => {
    it('Captures method callsites with the expected constructor name', () => {
        function capture () {
            return getCallsiteForMethod('capture');
        }

        const record = capture();

        expect(record.constructor.name).equal('CallsiteRecord');
        expect(record.filename).equal(__filename);
        expect(getRenderers(record)).equal(renderers);
        expect(record.renderSync({ renderer: renderers.noColor, frameSize: 0, stack: false }))
            .match(/ > \d+ \| {8}const record = capture\(\);/);
    });

    for (const rendererName of ['default', 'noColor', 'html']) {
        it(`Renders identical sync and async output with ${rendererName}`, async () => {
            const record = createCallsiteRecord({ forError: createError() });
            const options = { renderer: renderers[rendererName], frameSize: 0 };
            const sync = record.renderSync(options);

            expect(await record.render(options)).equal(sync);

            if (rendererName === 'noColor')
                expect(sync).equal(` > 2 |throw new Error(value);\n\n   at example (${filename}:2:7)`);
            else if (rendererName === 'html') {
                expect(sync).include('<div class="code-frame">');
                expect(sync).include('<span class="syntax-keyword">throw</span>');
                expect(sync).include('<div class="stack-line-name">example</div>');
            }
        });
    }

    it('Escapes source and stack content in HTML', () => {
        const error = createError();

        error.stack = `Error: test\n    at <script> (${filename}:1:1)`;

        const rendered = createCallsiteRecord({ forError: error })
            .renderSync({ renderer: renderers.html, frameSize: 0 });

        expect(rendered).include('&lt;script&gt;');
        expect(rendered).not.include('<script>');
    });

    it('Reads file URLs in both rendering modes', async () => {
        const record = createCallsiteRecord({ forError: createError(pathToFileURL(filename).href) });
        const options = { renderer: renderers.noColor, frameSize: 0, stack: false };

        expect(record.renderSync(options)).equal(' > 2 |throw new Error(value);');
        expect(await record.render(options)).equal(record.renderSync(options));
    });

    it('Filters and processes error frames', () => {
        const error = createError();

        error.stack = `Error: test\n    at ignored (ignored.js:1:1)\n    at example (${filename}:2:7)`;

        const record = createCallsiteRecord({
            forError:        error,
            isCallsiteFrame: frame => frame.getFileName() === filename,
            processFrameFn:  frame => {
                frame.lineNumber = 1;
                return frame;
            },
        });

        expect(record.renderSync({
            renderer:    renderers.noColor,
            frameSize:   0,
            codeFrame:   false,
            stackFilter: () => false,
        })).equal('');
        expect(record.lineNum).equal(0);
    });

    it('Returns null for missing callsites and malformed errors', () => {
        expect(createCallsiteRecord({ byFunctionName: 'nonexistentCallsiteFunction' })).equal(null);

        for (const stack of [null, '42']) {
            const error = new Error('test');

            error.stack = stack;
            expect(createCallsiteRecord({ forError: error })).equal(null);
        }

        expect(createCallsiteRecord({ forError: createError(), isCallsiteFrame: () => false })).equal(null);
    });

    it('Propagates source read failures in both rendering modes', async () => {
        const record = createCallsiteRecord({ forError: createError(filename + '.missing') });

        expect(() => record.renderSync()).throw();

        let error = null;

        try {
            await record.render();
        }
        catch (err) {
            error = err;
        }

        expect(error).have.property('code', 'ENOENT');
    });

    it('Distributes the original MIT attribution', () => {
        const license = fs.readFileSync(require.resolve('../../lib/utils/callsite-record/LICENSE'), 'utf8');

        expect(license).include('Copyright (c) 2016 Ivan Nikulin');
        expect(license).include('Permission is hereby granted, free of charge');
    });
});
