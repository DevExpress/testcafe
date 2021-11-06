// @ts-ignore
import { nativeMethods, utils } from '../../../deps/hammerhead';
import * as dom from '../../dom';
import * as position from '../../position';
import * as style from '../../style';
import { CoreUtilsAdapter } from '../types';
import sendRequestToFrame from '../../send-request-to-frame';

const browser = utils.browser;

const initializer: CoreUtilsAdapter = { nativeMethods, browser, dom, position, style, sendRequestToFrame };

export default initializer;
