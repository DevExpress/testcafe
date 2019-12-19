import OS from 'os-family';
import { parse as parseUrl } from 'url';
import dedicatedProviderChrome from '../chrome';
import getRuntimeInfo from './runtime-info';
import getConfig from './config';
import { start as startLocalChrome, stop as stopLocalChrome } from './local-chrome';
import * as cdp from './cdp';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../utils/client-functions';


const MIN_AVAILABLE_DIMENSION = 50;

export default {
    ...dedicatedProviderChrome
};
