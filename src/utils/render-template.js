export default function renderTemplate (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}
