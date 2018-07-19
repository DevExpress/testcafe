import { transport, utils } from '../deps/hammerhead';
import { disableRealEventsPreventing, preventRealEvents } from '../prevent-real-events';
import MESSAGES from '../../../test-run/client-messages';
import ACTION_TYPES from '../../../browser/provider/built-in/firefox/marionette-client/action-types';


export default {
    enabled: false,

    actionTypes: ACTION_TYPES,

    performAction (args) {
        disableRealEventsPreventing();

        const msgArgs = utils.extend({ disableResending: true, cmd: MESSAGES.performMarionetteAction }, args);

        return transport.queuedAsyncServiceMsg(msgArgs)
            .then(() => preventRealEvents());
    }
};
