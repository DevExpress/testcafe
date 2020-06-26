const colors = {
    'diff filler':  90,
    'diff added':   32,
    'diff removed': 31
};

function color (name, str) {
    if (colors[name])
        return '\u001b[' + colors[name] + 'm' + str + '\u001b[0m';


    return str;
}

export function colorLines (name, str) {
    return str
        .split('\n')
        .map(line => {
            return color(name, line);
        })
        .join('\n');
}
