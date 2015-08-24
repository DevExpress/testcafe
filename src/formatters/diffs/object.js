import getDatesDiff from './date';
import getStringsDiff from './string';
import truncateDiff from './truncate-diff';

export default function getObjectsDiff (err, maxStringLength) {
    if (err.diffType && err.diffType.isDates)
        return getDatesDiff(err);
    if (err.diffType && err.diffType.isStrings)
        return getStringsDiff(err, maxStringLength);

    return truncateDiff(err, maxStringLength);
}
