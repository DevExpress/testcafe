import getArraysDiff from './array';
import getObjectsDiff from './object';
import getStringsDiff from './string';
import getDatesDiff from './date';
import truncateDiff from './truncate-diff';

export default function buildDiff (err, maxStringLength) {
    if (err.isArrays)
        return getArraysDiff(err, maxStringLength);
    if (err.isObjects)
        return getObjectsDiff(err, maxStringLength);
    if (err.isStrings)
        return getStringsDiff(err, maxStringLength);
    if (err.isDates)
        return getDatesDiff(err);

    return truncateDiff(err, maxStringLength);
}
