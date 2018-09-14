import path from 'path';

export default function (paths) {
    if (!paths)
        return null;

    if (paths.length === 1)
        return paths[0];

    const pathArrs               = paths.map(item => item.split(path.sep));
    const isCommonPathFragment   = (pathFragment, idx) => pathArrs.every(pathArray => pathArray[idx] === pathFragment);
    const firstPathArr           = pathArrs[0];
    let commonPathFramgemtnIndex = 0;

    while (commonPathFramgemtnIndex < firstPathArr.length &&
           isCommonPathFragment(firstPathArr[commonPathFramgemtnIndex], commonPathFramgemtnIndex))
        commonPathFramgemtnIndex++;

    if (!commonPathFramgemtnIndex)
        return null;

    const commonPathFragments = firstPathArr.slice(0, commonPathFramgemtnIndex);

    return path.join(...commonPathFragments);
}
