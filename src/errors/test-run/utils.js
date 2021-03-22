import dedent from 'dedent';
import { escape as escapeHtml, repeat } from 'lodash';
import TEST_RUN_PHASE from '../../test-run/phase';
import { TEST_RUN_ERRORS } from '../types';

const SUBTITLES = {
    [TEST_RUN_PHASE.initial]:                 '',
    [TEST_RUN_PHASE.inFixtureBeforeHook]:     '<span class="subtitle">Error in fixture.before hook</span>\n',
    [TEST_RUN_PHASE.inFixtureBeforeEachHook]: '<span class="subtitle">Error in fixture.beforeEach hook</span>\n',
    [TEST_RUN_PHASE.inTestBeforeHook]:        '<span class="subtitle">Error in test.before hook</span>\n',
    [TEST_RUN_PHASE.inTest]:                  '',
    [TEST_RUN_PHASE.inTestAfterHook]:         '<span class="subtitle">Error in test.after hook</span>\n',
    [TEST_RUN_PHASE.inFixtureAfterEachHook]:  '<span class="subtitle">Error in fixture.afterEach hook</span>\n',
    [TEST_RUN_PHASE.inFixtureAfterHook]:      '<span class="subtitle">Error in fixture.after hook</span>\n',
    [TEST_RUN_PHASE.inRoleInitializer]:       '<span class="subtitle">Error in Role initializer</span>\n',
    [TEST_RUN_PHASE.inBookmarkRestore]:       '<span class="subtitle">Error while restoring configuration after Role switch</span>\n'
};

export function renderForbiddenCharsList (forbiddenCharsList) {
    return forbiddenCharsList.map(charInfo => `\t"${charInfo.chars}" at index ${charInfo.index}\n`).join('');
}

export function formatUrl (url) {
    return `<a href="${url}">${url}</a>`;
}

export function formatSelectorCallstack (apiFnChain, apiFnIndex, viewportWidth) {
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

export function formatExpressionMessage (expression, line, column) {
    const expressionStr = escapeHtml(expression);

    if (line === void 0 || column === void 0)
        return expressionStr;

    return `${expressionStr}\nat ${line}:${column}`;
}

export function replaceLeadingSpacesWithNbsp (str) {
    return str.replace(/^ +/mg, match => {
        return repeat('&nbsp;', match.length);
    });
}

export function shouldSkipCallsite (err) {
    return err.code === TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode ||
           err.code === TEST_RUN_ERRORS.unhandledPromiseRejection ||
           err.code === TEST_RUN_ERRORS.uncaughtException;
}

export function markup (err, msgMarkup, errCallsite = '') {
    msgMarkup = dedent(`${SUBTITLES[err.testRunPhase]}<div class="message">${dedent(msgMarkup)}</div>`);

    const browserStr = `\n\n<strong>Browser:</strong> <span class="user-agent">${err.userAgent}</span>`;

    if (errCallsite)
        msgMarkup += `${browserStr}\n\n${errCallsite}\n`;
    else
        msgMarkup += browserStr;

    if (err.screenshotPath)
        msgMarkup += `\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    if (!shouldSkipCallsite(err)) {
        const callsiteMarkup = err.getCallsiteMarkup();

        if (callsiteMarkup)
            msgMarkup += `\n\n${callsiteMarkup}`;
    }

    return msgMarkup.replace('\t', '&nbsp;'.repeat(4));
}

export function renderDiff (diff) {
    return diff ?
        `<span class="diff-added">+ expected</span> <span class="diff-removed">- actual</span>\n\n${diff}` : ``;
}
