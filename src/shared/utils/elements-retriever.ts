import { ExecuteSelectorCommand } from '../../test-run/commands/observation';
import { ExecuteSelectorFn } from '../types';
import NODE_TYPE_DESCRIPTIONS from '../utils/node-type-descriptions';
import {
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError,
} from '../../shared/errors';
import { getInvisibleErrorCtor, getNotFoundErrorCtor } from '../errors/selector-error-ctor-callback';
// @ts-ignore
import { nativeMethods, Promise } from '../../client/driver/deps/hammerhead';
// @ts-ignore
import { domUtils } from '../../client/driver/deps/testcafe-core';

export default class ElementsRetriever<T> {
    private readonly _globalSelectorTimeout: number;
    private readonly _ensureElementsStartTime: number;
    private readonly _executeSelectorFn: ExecuteSelectorFn<T>;
    private readonly _elements: T[];
    private _ensureElementsPromise: Promise<void>;

    public constructor (globalSelectorTimeout: number, executeSelectorFn: ExecuteSelectorFn<T>) {
        this._globalSelectorTimeout   = globalSelectorTimeout;
        this._ensureElementsStartTime = nativeMethods.dateNow();
        this._ensureElementsPromise   = Promise.resolve();
        this._executeSelectorFn       = executeSelectorFn;
        this._elements                = [];
    }

    public push (selector: ExecuteSelectorCommand, elementName?: string): void {
        this._ensureElementsPromise = this._ensureElementsPromise
            .then(() => {
                return this._executeSelectorFn(selector, {
                    invisible: getInvisibleErrorCtor(elementName),
                    notFound:  getNotFoundErrorCtor(elementName),
                }, this._ensureElementsStartTime);
            })
            .then((el: T) => {
                if (!domUtils.isDomElement(el)) {
                    const nodeType    = (el as unknown as { nodeType: number }).nodeType;
                    const nodeTypeStr = NODE_TYPE_DESCRIPTIONS[nodeType];

                    if (!elementName)
                        throw new ActionSelectorMatchesWrongNodeTypeError(nodeTypeStr);
                    else
                        throw new ActionAdditionalSelectorMatchesWrongNodeTypeError(elementName, nodeTypeStr);
                }

                this._elements.push(el);
            });

    }

    public getElements (): Promise<T[]> {
        return this._ensureElementsPromise.then(() => this._elements);
    }
}
