import Test from '../../api/structure/test';
import { Dictionary } from '../../configuration/interfaces';

export default function (test: Test, opts: Dictionary<OptionValue>): boolean {
    if (!test.isNativeAutomation)
        return false;

    if (opts.disableNativeAutomation && test.isNativeAutomation)
        return false;

    return true;
}
