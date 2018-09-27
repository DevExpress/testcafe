import path from 'path';


function getCommonPathFragmentsCount (fragmentedPath1, fragmentedPath2) {
    const maxCommonPathFragmentsCount = Math.min(fragmentedPath1.length, fragmentedPath2.length);

    let commonPathFragmentsIndex = 0;

    while (commonPathFragmentsIndex < maxCommonPathFragmentsCount) {
        if (fragmentedPath1[commonPathFragmentsIndex] !== fragmentedPath2[commonPathFragmentsIndex])
            break;

        commonPathFragmentsIndex++;
    }

    return commonPathFragmentsIndex;
}

function getCommonPathFragments (fragmentedPaths) {
    const lastFragmentedPath = fragmentedPaths.pop();

    const commonPathFragmentsCounts = fragmentedPaths
        .map(fragmentedPath => getCommonPathFragmentsCount(fragmentedPath, lastFragmentedPath));

    return lastFragmentedPath.splice(0, Math.min(...commonPathFragmentsCounts));
}

export default function (paths) {
    if (!paths)
        return null;

    if (paths.length === 1)
        return paths[0];

    const fragmentedPaths     = paths.map(item => item.split(path.sep));
    const commonPathFragments = getCommonPathFragments(fragmentedPaths);


    if (!commonPathFragments.length)
        return null;

    return commonPathFragments.join(path.sep);
}
