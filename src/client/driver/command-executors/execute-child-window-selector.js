import hammerhead from '../deps/hammerhead';
import { ChildWindowNotFoundError } from '../../../errors/test-run';

const Promise = hammerhead.Promise;

export default function executeChildWindowSelector (selector, childWindowLinks) {
    if (typeof selector === 'string') {
        const foundChildWindowDriverLink = childWindowLinks.filter(link => link.pageId === selector)[0];

        if (!foundChildWindowDriverLink) {
            const error = new ChildWindowNotFoundError();

            throw error;
        }

        return Promise.resolve(foundChildWindowDriverLink.driverWindow);
    }

    // TODO:  Query url and title properties of the all driverLinks' windows
    return Promise.resolve(null);
}
