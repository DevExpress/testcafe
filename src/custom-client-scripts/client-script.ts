import { readFile } from '../utils/promisified-functions';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { isAbsolute, join } from 'path';
import { RequestFilterRule, generateUniqueId } from 'testcafe-hammerhead';
import { createHash } from 'crypto';
import ClientScriptInit from './client-script-init';

const BEAUTIFY_REGEXP = /[/.:\s\\]/g;
const BEAUTIFY_CHAR   = '_';

const EMPTY_CONTENT_STR      = '{ content: <empty> }';
const CONTENT_STR_MAX_LENGTH = 30;
const CONTENT_ELLIPSIS_STR   = '...';

const URL_UNIQUE_PART_LENGTH = 7;

export default class ClientScript {
    private readonly init: null | string | ClientScriptInit;
    public url: string;
    public content: string;
    public path: string | null;
    public module: string | null;
    public hash: Buffer | null;
    public page: RequestFilterRule;
    private readonly basePath: string;

    public constructor (init: string | ClientScriptInit, basePath: string) {
        this.init     = init || null;
        this.url      = generateUniqueId(URL_UNIQUE_PART_LENGTH);
        this.content  = '';
        this.path     = null;
        this.module   = null;
        this.hash     = null;
        this.page     = RequestFilterRule.ANY;
        this.basePath = basePath;
    }

    private _resolvePath (path: string): string {
        let resolvedPath = null;

        if (isAbsolute(path))
            resolvedPath = path;
        else {
            if (!this.basePath)
                throw new GeneralError(RUNTIME_ERRORS.clientScriptBasePathIsNotSpecified);

            resolvedPath = join(this.basePath, path);
        }

        return resolvedPath;
    }

    private async _loadFromPath (path: string): Promise<void> {
        const resolvedPath = this._resolvePath(path);

        try {
            this.path    = resolvedPath;
            this.content = await readFile(this.path);
            this.content = this.content.toString();
            this.url     = path || this.url;
        }
        catch (e) {
            throw new GeneralError(RUNTIME_ERRORS.cannotLoadClientScriptFromPath, path);
        }
    }

    private async _loadFromModule (name: string): Promise<void> {
        let resolvedPath = null;

        try {
            resolvedPath = require.resolve(name);
        }
        catch (e) {
            throw new GeneralError(RUNTIME_ERRORS.clientScriptModuleEntryPointPathCalculationError, e.message);
        }

        await this._loadFromPath(resolvedPath);

        this.module = name;
    }

    private _prepareUrl (): void {
        this.url = this.url.replace(BEAUTIFY_REGEXP, BEAUTIFY_CHAR).toLowerCase();
    }

    public async load (): Promise<void> {
        if (this.init === null)
            throw new GeneralError(RUNTIME_ERRORS.clientScriptInitializerIsNotSpecified);
        else if (typeof this.init === 'string')
            await this._loadFromPath(this.init);
        else {
            const { path: initPath, content: initContent, module: initModule, page: initPage } = this.init as ClientScriptInit;

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

        this._calculateHash();
        this._prepareUrl();
    }

    private _calculateHash (): void {
        this.hash = createHash('md5').update(this.content).digest();
    }

    private _contentToString (): string {
        let displayContent;

        if (this.content.length <= CONTENT_STR_MAX_LENGTH - CONTENT_ELLIPSIS_STR.length)
            displayContent = this.content;
        else
            displayContent = this.content.substring(0, CONTENT_STR_MAX_LENGTH - CONTENT_ELLIPSIS_STR.length) + CONTENT_ELLIPSIS_STR;

        return `{ content: '${displayContent}' }`;
    }

    public toString (): string {
        if (!this.content)
            return EMPTY_CONTENT_STR;

        else if (this.content && !this.path)
            return this._contentToString();

        return `{ path: '${this.path}' }`;
    }

    public static get URL_UNIQUE_PART_LENGTH (): number {
        return URL_UNIQUE_PART_LENGTH;
    }
}
