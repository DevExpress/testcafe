import { readFile } from '../utils/promisified-functions';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { isAbsolute, resolve as resolvePath } from 'path';
import { RequestFilterRule, generateUniqueId } from 'testcafe-hammerhead';

const BEAUTIFY_REGEXP = /[/.:\s\\]/g;
const BEAUTIFY_CHAR   = '_';

const EMPTY_CONTENT_STR      = '{ content: <empty> }';
const CONTENT_STR_MAX_LENGTH = 30;
const CONTENT_ELLIPSIS_STR   = '...';

const URL_UNIQUE_PART_LENGTH = 7;

export default class ClientScript {
    constructor (init, basePath) {
        this.init     = init || null;
        this.url      = generateUniqueId(URL_UNIQUE_PART_LENGTH);
        this.content  = '';
        this.path     = null;
        this.module   = null;
        this.page     = RequestFilterRule.ANY;
        this.basePath = basePath;
    }

    async _loadFromPath (path) {
        try {
            const resolvedPath = isAbsolute(path) ? path : resolvePath(this.basePath, path);

            this.path    = resolvedPath;
            this.content = await readFile(this.path);
            this.content = this.content.toString();
            this.url     = path || this.url;
        }
        catch (e) {
            throw new GeneralError(RUNTIME_ERRORS.cannotLoadClientScriptFromPath, path);
        }
    }

    async _loadFromModule (name) {
        const resolvedPath = require.resolve(name);

        await this._loadFromPath(resolvedPath);
    }

    _prepareUrl () {
        this.url = this.url.replace(BEAUTIFY_REGEXP, BEAUTIFY_CHAR).toLowerCase();
    }

    async load () {
        if (this.init === null)
            throw new GeneralError(RUNTIME_ERRORS.clientScriptInitializerIsNotSpecified);
        else if (!this.basePath)
            throw new GeneralError(RUNTIME_ERRORS.clientScriptBasePathIsNotSpecified);
        else if (typeof this.init === 'string')
            await this._loadFromPath(this.init);
        else {
            const { path: initPath, content: initContent, module: initModule, page: initPage } = this.init;

            if (initPath && initContent || initPath && initModule || initContent && initModule)
                throw new GeneralError(RUNTIME_ERRORS.clientScriptInitializerMultipleContentSources);

            if (initPath)
                await this._loadFromPath(initPath);
            else if (initModule)
                await this._loadFromModule(initModule);
            else
                this.content = initContent;

            if (initPage)
                this.page = new RequestFilterRule(initPage);
        }

        this._prepareUrl();
    }

    _contentToString () {
        let displayContent = '';

        if (this.content.length <= CONTENT_STR_MAX_LENGTH - CONTENT_ELLIPSIS_STR.length)
            displayContent = this.content;
        else
            displayContent = this.content.substring(0, CONTENT_STR_MAX_LENGTH - CONTENT_ELLIPSIS_STR.length) + CONTENT_ELLIPSIS_STR;

        return `{ content: '${displayContent}' }`;
    }

    toString () {
        if (!this.content)
            return EMPTY_CONTENT_STR;

        else if (this.content && !this.path)
            return this._contentToString();

        return `{ path: '${this.path}' }`;
    }

    static get URL_UNIQUE_PART_LENGTH () {
        return URL_UNIQUE_PART_LENGTH;
    }
}
