export default function delegatedAPI (methodName: string, accessor = ''): string {
    return `_${ methodName }$${ accessor }`;
}
