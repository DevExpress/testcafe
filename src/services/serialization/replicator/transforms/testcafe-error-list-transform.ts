import BaseTransform from './base-transform';
import TestCafeErrorList from '../../../../errors/error-list';

interface SerializedTestCafeErrorList {
    items: unknown[];
}

export default class TestCafeErrorListTransform extends BaseTransform {
    public constructor () {
        super('TestCafeErrorList');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof TestCafeErrorList;
    }

    public fromSerializable (value: SerializedTestCafeErrorList): TestCafeErrorList {
        const errorList = new TestCafeErrorList();

        errorList.items = value.items;

        return errorList;
    }
}
