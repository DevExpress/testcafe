/*eslint-disable no-undef, no-var*/
function getTitle () {
    return document.title;
}

function getWindowDimensionsInfo () {
    return {
        width:           window.innerWidth,
        height:          window.innerHeight,
        outerWidth:      window.outerWidth,
        outerHeight:     window.outerHeight,
        availableWidth:  screen.availWidth,
        availableHeight: screen.availHeight
    };
}

function getWindowId () {
    var array  = new Uint16Array(1);
    var crypto = window.crypto || window.msCrypto;

    crypto.getRandomValues(array);

    return array[0].toString();
}
/*eslint-disable no-undef, no-var*/

export const GET_TITLE_SCRIPT                  = getTitle.toString();
export const GET_WINDOW_DIMENSIONS_INFO_SCRIPT = getWindowDimensionsInfo.toString();
export const GET_WINDOW_ID_SCRIPT              = getWindowId.toString();
