import getObjectDiff from './object';

function addDiffIndexPrefix (diff, arrayIndexStr) {
    //NOTE: add gaps with length equal the length of prefix
    //'1' => '[0]: 1'
    //'^' => '     ^'
    var marker = diff.marker ? arrayIndexStr.replace(/./g, ' ') + diff.marker : '';

    diff.expected = arrayIndexStr + diff.expected;
    diff.actual   = arrayIndexStr + diff.actual;
    diff.marker   = marker;
}

export default function getArraysDiff (err, maxStringLength) {
    var arrayIndexStr = `[${err.key}]: `;

    maxStringLength -= arrayIndexStr.length;

    var diff = getObjectDiff(err, maxStringLength);

    addDiffIndexPrefix(diff, arrayIndexStr);

    return diff;
}
