// @ts-ignore
import hammerhead from './deps/hammerhead';
import { initializeAdapter } from '../../shared/adapter/index';
import { MouseClickStrategyEmpty } from '../../shared/actions/automations/click/mouse-click-strategy-base';

const { Promise } = hammerhead;


initializeAdapter({
    // NOTE: this functions are unnecessary in the core

    automations: {
        click: {
            createMouseClickStrategy: () => new MouseClickStrategyEmpty(),
        },

        _ensureWindowAndCursorForLegacyTests () { // eslint-disable-line no-empty-function
        },
    },
});
