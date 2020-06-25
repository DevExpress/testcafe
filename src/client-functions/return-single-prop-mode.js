export default function (options) {
    if (!options)
        return false;

    return options.counterMode || options.getVisibleValueMode;
}
