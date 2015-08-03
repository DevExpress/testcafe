import SpecReporter from './spec';
import ListReporter from './list';
import MinimalReporter from './minimal';
import JSONReporter from './json';
import XUnitReporter from './xunit';

export default {
    spec:    SpecReporter,
    list:    ListReporter,
    minimal: MinimalReporter,
    json:    JSONReporter,
    xunit:   XUnitReporter
};

