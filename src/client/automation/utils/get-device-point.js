export default function getDevicePoint (clientPoint) {
    if (!clientPoint)
        return null;

    const screenLeft = window.screenLeft || window.screenX;
    const screenTop  = window.screenTop || window.screenY;
    const x          = screenLeft + clientPoint.x;
    const y          = screenTop + clientPoint.y;

    return { x, y };
}
