export default function (...args) {
    return args.map(arg => `"${arg}"`).join(', ');
}
