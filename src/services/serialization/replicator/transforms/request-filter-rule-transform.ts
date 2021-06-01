import { RequestFilterRule } from 'testcafe-hammerhead';
import BaseTransform from './base-transform';
import { SerializedEntityWithPredicate } from '../interfaces';


export default class RequestFilterRuleTransform extends BaseTransform {
    public constructor () {
        super('RequestFilterRule');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof RequestFilterRule;
    }

    public fromSerializable (value: SerializedEntityWithPredicate): RequestFilterRule {
        const rule = RequestFilterRule.from(value as object);

        rule.isPredicate = value.isPredicate;

        return rule;
    }
}
