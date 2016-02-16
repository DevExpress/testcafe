export default function handleTagArgs (firstArg, rest) {
    if (Array.isArray(firstArg) && Array.isArray(firstArg.raw))
        return String.raw.call(null, firstArg, ...rest);

    return firstArg;
}
