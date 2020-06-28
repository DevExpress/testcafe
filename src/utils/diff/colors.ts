import { Colors } from './types';

const colors: Colors = {
    'diff filler':  90,
    'diff added':   32,
    'diff removed': 31
};

function color (name: string, str: string): string {
    if (colors[name])
        return '\u001b[' + colors[name] + 'm' + str + '\u001b[0m';


    return str;
}

export function colorLines (name: string, str: string): string {
    return str
        .split('\n')
        .map((line: string): string => {
            return color(name, line);
        })
        .join('\n');
}
