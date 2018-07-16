import { transport, nativeMethods } from '../deps/hammerhead';
import { disableRealEventsPreventing, preventRealEvents } from '../prevent-real-events';
import MESSAGE from '../../../test-run/client-messages';


export default {
    enabled: false,

    performAction (args) {
        disableRealEventsPreventing();

        const msgArgs = { disableResending: true, cmd: MESSAGE.performActions };

        nativeMethods.objectKeys.call(window.Object, args).forEach(prop => {
            msgArgs[prop] = args[prop];
        });

        return transport.queuedAsyncServiceMsg(msgArgs)
            .then(() => preventRealEvents());
    }
};
