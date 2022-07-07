import { initializeAdapter } from '../../shared/adapter/index';
import cursor from './cursor';


initializeAdapter({
    automations: {
        _ensureWindowAndCursorForLegacyTests (automation) {
            automation.window = automation.window || window;
            automation.cursor = cursor;
        },
    },
});
