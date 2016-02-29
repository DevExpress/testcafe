import { assignIn } from 'lodash';
import TestRunError from '../../errors/test-run';
import TEMPLATES from './templates';

export default class LegacyTestRunError extends TestRunError {
    constructor (clientErr) {
        super();

        this.TEMPLATES = TEMPLATES;
        assignIn(this, clientErr);
    }
}
