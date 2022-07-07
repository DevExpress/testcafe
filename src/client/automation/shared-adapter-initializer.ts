import { initializeAdapter } from '../../shared/adapter/index';
import { createMouseClickStrategy } from './playback/click/browser-click-strategy';
import cursor from './cursor';


initializeAdapter({
    automations: {
        click: {
            createMouseClickStrategy,
        },

        _ensureWindowAndCursorForLegacyTests (automation) {
            automation.window = automation.window || window;
            automation.cursor = cursor;
        },
    },
});
