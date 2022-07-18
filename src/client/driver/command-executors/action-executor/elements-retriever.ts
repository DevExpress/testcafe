import { ExecuteSelectorCommand } from '../../../../test-run/commands/observation';
import { ExecuteSelectorFn } from '../../../../shared/types';
import NODE_TYPE_DESCRIPTIONS from '../../node-type-descriptions';
import {
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError,
} from '../../../../shared/errors';
import { getInvisibleErrorCtor, getNotFoundErrorCtor } from '../../../../shared/errors/selector-error-ctor-callback';
// @ts-ignore
import { nativeMethods, Promise } from '../../deps/hammerhead';
// @ts-ignore
import { domUtils } from '../../deps/testcafe-core';

export default class ElementsRetriever {
    private readonly _globalSelectorTimeout: number;
    private readonly _ensureElementsStartTime: number;
    private readonly _executeSelectorFn: ExecuteSelectorFn<HTMLElement>;
    private readonly _elements: HTMLElement[];
    private _ensureElementsPromise: Promise<void>;

    public constructor (globalSelectorTimeout: number, executeSelectorFn: ExecuteSelectorFn<HTMLElement>) {
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
            .then((el: HTMLElement) => {
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

    public getElements (): Promise<HTMLElement[]> {
        return this._ensureElementsPromise.then(() => this._elements);
    }
}
