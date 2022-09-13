function formatSelectorCallstack (apiFnChain, apiFnIndex = 0, viewportWidth = Infinity) {
    if (typeof apiFnIndex === 'undefined')
        return '';

    const emptySpaces    = 10;
    const ellipsis       = '...)';
    const availableWidth = viewportWidth - emptySpaces;

    return apiFnChain.map((apiFn, index) => {
        let formattedApiFn = String.fromCharCode(160);

        formattedApiFn += index === apiFnIndex ? '>' : ' ';
        formattedApiFn += ' | ';
        formattedApiFn += index !== 0 ? '  ' : '';
        formattedApiFn += apiFn;

        if (formattedApiFn.length > availableWidth)
            return formattedApiFn.substr(0, availableWidth - emptySpaces) + ellipsis;

        return formattedApiFn;
    }).join('\n');
}

export default formatSelectorCallstack;
