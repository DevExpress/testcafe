export default function createSnapshotMethods (snapshot) {
    var isElementSnapshot = !!snapshot.tagName;

    if (isElementSnapshot) {
        snapshot.hasClass                      = name => snapshot.classNames.indexOf(name) > -1;
        snapshot.getStyleProperty              = prop => snapshot.style[prop];
        snapshot.getAttribute                  = attrName => snapshot.attributes[attrName];
        snapshot.getBoundingClientRectProperty = prop => snapshot.boundingClientRect[prop];
    }
}
