export default function isPasswordInput (node: any): boolean {
    return node && node.tagName === 'input' && node.attributes.type === 'password';
}
