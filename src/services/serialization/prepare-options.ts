import { Dictionary } from '../../configuration/interfaces';
import OptionNames from '../../configuration/option-names';

const NECESSARY_OPTIONS = [
    OptionNames.assertionTimeout
];

export default function (value: Dictionary<OptionValue>): Dictionary<OptionValue> {
    const result = Object.create(null);

    NECESSARY_OPTIONS.forEach(optionName => {
        result[optionName] = value[optionName];
    });

    return result;
}
