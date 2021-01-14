import { WindowDimentionsInfo } from '../../interfaces';

/*eslint-disable no-undef, no-var*/
function getTitle (): string {
    return document.title;
}

function getWindowDimensionsInfo (): WindowDimentionsInfo {
    return {
        width:           window.innerWidth,
        height:          window.innerHeight,
        outerWidth:      window.outerWidth,
        outerHeight:     window.outerHeight,
        availableWidth:  screen.availWidth,
        availableHeight: screen.availHeight
    };
}

function getIsServiceWorkerEnabled (): boolean {
    return !!navigator.serviceWorker;
}
/*eslint-disable no-undef, no-var*/

export const GET_TITLE_SCRIPT                  = getTitle.toString();
export const GET_WINDOW_DIMENSIONS_INFO_SCRIPT = getWindowDimensionsInfo.toString();
export const GET_IS_SERVICE_WORKER_ENABLED     = getIsServiceWorkerEnabled.toString();

