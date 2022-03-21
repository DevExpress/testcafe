import { escapeRegExp as escapeRe, flatten } from 'lodash';
import { assertBaseUrl, getUrl } from '../../api/test-page-url';
import { assertType, is } from '../../errors/runtime/type-assertions';

export default class TestFileCompilerBase {
    constructor ({ baseUrl }) {
        const escapedExt = flatten([this.getSupportedExtension()])
            .map(ext => escapeRe(ext))
            .join('|');

        this.supportedExtensionRe = new RegExp(`(${escapedExt})$`);
        this.baseUrl = baseUrl;

        this._ensureBaseUrl();
    }

    _ensureBaseUrl () {
        if (!this.baseUrl)
            return;

        assertType(is.string, '_ensureBaseUrl', 'The base URL', this.baseUrl);
        assertBaseUrl(this.baseUrl, '_ensureBaseUrl');

        this.baseUrl = getUrl(this.baseUrl);
    }

    _hasTests (/* code */) {
        throw new Error('Not implemented');
    }

    getSupportedExtension () {
        throw new Error('Not implemented');
    }

    async precompile (/* testFilesInfo */) {
        throw new Error('Not implemented');
    }

    async compile (/* code, filename */) {
        throw new Error('Not implemented');
    }

    async execute (/* compiledCode, filename */) {
        throw new Error('Not implemented');
    }

    canCompile (code, filename) {
        return this.supportedExtensionRe.test(filename);
    }

    get canPrecompile () {
        return false;
    }

    cleanUp () {
        // NOTE: Optional. Do nothing by default.
    }
}
