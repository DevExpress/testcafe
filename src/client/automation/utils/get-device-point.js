export default function getDevicePoint (clientPoint) {
    const x = (window.screenLeft || window.screenX) + clientPoint.x;
    const y = (window.screenTop || window.screenY) + clientPoint.y;

    return { x, y };
}
