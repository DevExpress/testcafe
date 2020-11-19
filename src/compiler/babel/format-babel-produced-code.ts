export default function (code: string): string {
    return code.replace(/  +/g, ' ')
        .replace(/\r?\n|\r/g, '')
        .replace(/[{,;}] /g, str => {
            return str.trim();
        });
}
