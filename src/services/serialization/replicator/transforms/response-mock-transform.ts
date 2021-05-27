import BaseTransform from './base-transform';
import { ResponseMock } from 'testcafe-hammerhead';
import { SerializedEntityWithPredicate } from '../interfaces';


export default class ResponseMockTransform extends BaseTransform {
    public constructor () {
        super('ResponseMock');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof ResponseMock;
    }

    public fromSerializable (value: SerializedEntityWithPredicate): ResponseMock {
        const mock = ResponseMock.from(value as object);

        mock.isPredicate = value.isPredicate;

        return mock;
    }
}
