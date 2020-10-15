const { expect } = require('chai');

describe('Compiler options', () => {
    describe('TypeScript', () => {
        const createOptions = (typeScriptCompilerOptions, opts = {}) => {
            const resultOpts = {
                'only':            'chrome',
                'compilerOptions': {
                    'typescript': {}
                }
            };

            Object.assign(resultOpts, opts);
            Object.assign(resultOpts.compilerOptions.typescript, typeScriptCompilerOptions);

            return resultOpts;
        };

        it('Should use custom compiler options', () => {
            return runTests('./testcafe-fixtures/typescript/custom-options.ts', null,
                createOptions({ 'options': { noImplicitAny: true } }), { shouldFail: true })
                .catch(err => {
                    expect(err.toString()).contains("Parameter 'arg' implicitly has an 'any' type.");
                });
        });

        it('Should not fail on invalid compiler options', () => {
            return runTests('./testcafe-fixtures/typescript/index.ts', null,
                createOptions({ 'options': { unknownOption: 123 } }));
        });
    });
});
