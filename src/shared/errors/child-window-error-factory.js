import { TEST_RUN_ERRORS } from '../../errors/types';

import {
    CannotCloseWindowWithChildrenError,
    SwitchToWindowPredicateError,
    WindowNotFoundError
} from './';

export default class ChildWindowValidationErrorFactory {
    static createError ({ errCode, errMsg }) {
        if (errCode === TEST_RUN_ERRORS.cannotCloseWindowWithChildrenError)
            return new CannotCloseWindowWithChildrenError();

        if (errCode === TEST_RUN_ERRORS.switchToWindowPredicateError)
            return new SwitchToWindowPredicateError(errMsg);

        return new WindowNotFoundError();
    }
}
