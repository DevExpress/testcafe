export const generatePatternMap = function (options) {
    return {
        FIXTURE:            options.fixture,
        TEST:               options.test,
        TEST_INDEX:         options.testIndex,
        DATE:               options.currentDate,
        TIME:               options.currentTime,
        USERAGENT:          options.userAgent.full,
        BROWSER:            options.userAgent.browser,
        BROWSER_VERSION:    options.userAgent.browserVersion,
        OS:                 options.userAgent.os,
        OS_VERSION:         options.userAgent.osVersion,
        QUARANTINE_ATTEMPT: options.quarantineAttempt
    };
};

export const parseFileIndex = function (fileName, screenshotIndex) {
    if (fileName.indexOf('${FILE_INDEX}') !== -1)
        return fileName.replace(new RegExp('\\$\\{FILE_INDEX\\}', 'g'), (screenshotIndex - 1).toString().padStart(3, 0));
    else if (screenshotIndex > 2)
        return `${fileName}-${screenshotIndex - 1}`;

    return fileName;
};

export const parse = function (namePattern, patternMap, options) {
    if (!namePattern) return '';

    const spaceRegex = new RegExp(' ', 'g');
    const dtfRegex = new RegExp('(\\${DTF_.+?})', 'g');
    const dtfFormatRegex = new RegExp('{DTF_(.+)}');

    for (const pattern in patternMap)
        namePattern = namePattern.replace(new RegExp(`\\$\\{${pattern}\\}`, 'g'), patternMap[pattern]);

    const dtfMatches = namePattern.match(dtfRegex);

    if (dtfMatches && dtfMatches.length > 0) {
        const now = options.now;

        dtfMatches.forEach(dtfPattern => {
            const formatMatch = dtfFormatRegex.exec(dtfPattern);
            const formattedValue = now.format(formatMatch[1]);
            const escapedDTFPattern = dtfPattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

            namePattern = namePattern.replace(new RegExp(escapedDTFPattern, 'g'), formattedValue);
        });
    }

    return namePattern.replace(spaceRegex, '-');
};
