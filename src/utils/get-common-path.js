import path from 'path';

export default function (paths) {
    if (!paths)
        return null;

    if (paths.length === 1)
        return paths[0];

    const pathArrs               = paths.map(item => item.split(path.sep));
    const isCommonPathFragment   = (pathFragment, idx) => pathArrs.every(pathArray => pathArray[idx] === pathFragment);
    let commonPathFramgemtnIndex = 0;

    while (isCommonPathFragment(pathArrs[0][commonPathFramgemtnIndex], commonPathFramgemtnIndex))
        commonPathFramgemtnIndex++;

    if (!commonPathFramgemtnIndex)
        return null;

    const commonPathFragments = pathArrs[0].slice(0, commonPathFramgemtnIndex);

    return path.join(...commonPathFragments);
}
