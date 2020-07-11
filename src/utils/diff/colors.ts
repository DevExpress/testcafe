import { escape as escapeHTML } from 'lodash';

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
        return colorLines('diff-added', line);


    if (line[0] === '-')
        return colorLines('diff-removed', line);


    return colorLines('diff-filler', line);
}
