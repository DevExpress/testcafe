export default function isPasswordInput (node?: NodeSnapshot): boolean {
    if (!node)
        return false;

    return node.tagName === 'input' && node.attributes?.type === 'password';
}
