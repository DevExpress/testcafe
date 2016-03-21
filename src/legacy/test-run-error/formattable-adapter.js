import TestRunErrorFormattableAdapter from '../../errors/test-run/formattable-adapter';
import TEMPLATES from './templates';

export default class LegacyTestRunErrorFormattableAdapter extends TestRunErrorFormattableAdapter {
    constructor (err, userAgent) {
        super(err, userAgent);

        this.TEMPLATES = TEMPLATES;
    }
}
