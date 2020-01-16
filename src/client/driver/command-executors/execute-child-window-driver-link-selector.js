import hammerhead from '../deps/hammerhead';
import { ChildWindowNotFoundError } from '../../../errors/test-run';
import { arrayUtils } from '../deps/testcafe-core';

const Promise = hammerhead.Promise;

export default function executeChildWindowDriverLinkSelector (selector, childWindowLinks) {
    if (typeof selector === 'string') {
        const foundChildWindowDriverLink = arrayUtils.find(childWindowLinks, link => link.windowId === selector);

        if (!foundChildWindowDriverLink) {
            const error = new ChildWindowNotFoundError();

            return Promise.reject(error);
        }

        // NOTE: We cannot pass the driver window of the found child window driver link
        // because the current Promise implementation checks the type of the value passed to the 'resolve' function.
        // It causes an unhandled JavaScript error on accessing to cross-domain iframe.
        return Promise.resolve(foundChildWindowDriverLink);
    }

    // TODO:  Query url and title properties of the all driverLinks' windows
    return Promise.resolve(null);
}
