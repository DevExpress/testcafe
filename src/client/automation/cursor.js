import testCafeUI from './deps/testcafe-ui';
import isIframeWindow from '../../shared/utils/is-window-iframe';
import Cursor from '../../shared/actions/cursor';

const cursorUI = !isIframeWindow(window) ? testCafeUI.cursorUI : testCafeUI.iframeCursorUI;

export default new Cursor(window.top, cursorUI);
