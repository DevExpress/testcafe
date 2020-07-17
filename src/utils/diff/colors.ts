import { escape as escapeHTML } from 'lodash';

export const DIFF_COLORS = {
    DIFF_ADDED:        'diff-added',
    DIFF_REMOVED:      'diff-removed',
    DIFF_NOT_MODIFIED: 'diff-not-modified'
};

function color (name: string, str: string): string {
    return `<span class="${name}">${escapeHTML(str)}</span>`;
}

export function colorLines (name: string, str: string): string {
    return str
        .split('\n')
        .map((line: string): string => {
            return color(name, line);
        })
        .join('\n');
}

export function setColors (line: string): string {
    if (line[0] === '+')
        return colorLines(DIFF_COLORS.DIFF_ADDED, line);

    if (line[0] === '-')
        return colorLines(DIFF_COLORS.DIFF_REMOVED, line);

    return colorLines(DIFF_COLORS.DIFF_NOT_MODIFIED, line);
}
