import { escapeRegExp as escapeRe, flatten } from 'lodash';
import { assertBaseUrl, getUrl } from '../../api/test-page-url';
import OPTION_NAMES from '../../configuration/option-names';

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

        assertBaseUrl(this.baseUrl, OPTION_NAMES.baseUrl)

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
