// @ts-ignore
import { Promise } from '../../deps/hammerhead';
import { initializeAdapter } from './index';
import controller from '../controller';


initializeAdapter({
    PromiseCtor: Promise,

    controller,
});
