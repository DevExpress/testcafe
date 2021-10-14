import { adapter } from '../adapter';
import { ExecuteSelectorCommand } from '../../test-run/commands/observation';
import { ExecuteSelectorFn } from '../types';
import NODE_TYPE_DESCRIPTIONS from '../utils/node-type-descriptions';
import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    ActionAdditionalElementNotFoundError,
    ActionAdditionalElementIsInvisibleError,
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError,
} from '../../shared/errors';


export default class ElementsRetriever<T> {
    private readonly _globalSelectorTimeout: number;
    private readonly _ensureElementsStartTime: number;
    private readonly _executeSelectorFn: ExecuteSelectorFn<T>;
    private readonly _elements: T[];
    private _ensureElementsPromise: Promise<void>;

    public constructor (globalSelectorTimeout: number, executeSelectorFn: ExecuteSelectorFn<T>) {
        this._globalSelectorTimeout   = globalSelectorTimeout;
        this._ensureElementsStartTime = adapter.nativeMethods.dateNow();
        this._ensureElementsPromise   = adapter.PromiseCtor.resolve();
        this._executeSelectorFn       = executeSelectorFn;
        this._elements                = [];
    }

    public push (selector: ExecuteSelectorCommand, elementName?: string): void {
        this._ensureElementsPromise = this._ensureElementsPromise
            .then(() => {
                return this._executeSelectorFn(selector, {
                    invisible: !elementName ? ActionElementIsInvisibleError.name : {
                        name:     ActionAdditionalElementIsInvisibleError.name,
                        firstArg: elementName,
                    },
                    notFound: !elementName ? ActionElementNotFoundError.name : {
                        name:     ActionAdditionalElementNotFoundError.name,
                        firstArg: elementName,
                    },
                }, this._ensureElementsStartTime);
            })
            .then(el => {
                if (!adapter.isDomElement(el)) {
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
