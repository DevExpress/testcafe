import testCafeUI from '../deps/testcafe-ui';
import isIframeWindow from '../../../utils/is-window-in-iframe';
import Cursor from './cursor';

const cursorUI = !isIframeWindow(window) ? testCafeUI.cursorUI : testCafeUI.iframeCursorUI;

export default new Cursor(window.top, cursorUI);
