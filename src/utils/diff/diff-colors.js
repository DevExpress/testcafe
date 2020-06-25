const colors = {
    'diff gutter': 90,
    'diff added': 32,
    'diff removed': 31
};

export const color = (type, str) => {
    if (!colors) {                                                          //CHANGE LATER
        return String(str);
    }
    return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
};

export const colorLines = (name, str) => {
    return str
        .split('\n')
        .map(function(str) {
            return color(name, str);
        })
        .join('\n');
};