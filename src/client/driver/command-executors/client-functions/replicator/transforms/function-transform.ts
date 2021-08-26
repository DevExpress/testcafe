import { Transform } from 'replicator';
import { Dictionary } from '../../../../../../configuration/interfaces';
import { SelectorDependencies } from '../../types';
import selectorFilter from '../../selector-executor/filter';
import evalFunction from '../../eval-function';

export default class FunctionTransform implements Transform {
    public readonly type = 'Function';

    public shouldTransform (type: string): boolean {
        return type === 'function';
    }

    public toSerializable (): string {
        return '';
    }

    // HACK: UglifyJS + TypeScript + argument destructuring can generate incorrect code.
    // So we have to use plain assignments here.
    public fromSerializable (opts: { fnCode: string; dependencies: Dictionary<unknown> }): Function {
        const fnCode       = opts.fnCode;
        const dependencies = opts.dependencies;

        if ('filterOptions' in dependencies)
            (dependencies as SelectorDependencies).selectorFilter = selectorFilter;

        return evalFunction(fnCode, dependencies);
    }
}
