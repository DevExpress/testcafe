import { ReporterPlugin } from './interfaces';
import { EnumFromPropertiesOf } from '../utils/types';

const ReporterPluginMethod: EnumFromPropertiesOf<ReporterPlugin> = {
    reportTaskStart:       'reportTaskStart',
    reportFixtureStart:    'reportFixtureStart',
    reportTestStart:       'reportTestStart',
    reportTestActionStart: 'reportTestActionStart',
    reportTestActionDone:  'reportTestActionDone',
    reportTestDone:        'reportTestDone',
    reportTaskDone:        'reportTaskDone',
    reportWarnings:        'reportWarnings',
};

export default ReporterPluginMethod;
