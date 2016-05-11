import DriverStatus from '../status';
import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError
} from '../../../errors/test-run';

import { ensureElement } from './ensure-element-utils';


export default function executeWaitForElementCommand (command, elementAvailabilityTimeout) {
    return ensureElement(command.selector, command.timeout || elementAvailabilityTimeout,
        () => new ActionElementNotFoundError(),
        () => new ActionElementIsInvisibleError())
        .then(() => new DriverStatus({ isCommandResult: true }))
        .catch(err => new DriverStatus({ isCommandResult: true, executionError: err }));
}

