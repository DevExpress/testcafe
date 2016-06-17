// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default class Assignable {
    _getAssignableProperties () {
        throw new Error('Not implemented');
    }

    _assignFrom (obj, validate) {
        if (!obj)
            return;

        var props = this._getAssignableProperties();

        for (var i = 0; i < props.length; i++) {
            var { name, type, required, init } = props[i];

            var path    = name.split('.');
            var lastIdx = path.length - 1;
            var last    = path[lastIdx];
            var srcObj  = obj;
            var destObj = this;

            for (var j = 0; j < lastIdx && srcObj && destObj; j++) {
                srcObj  = srcObj[path[j]];
                destObj = destObj[path[j]];
            }

            if (srcObj && destObj) {
                var srcVal = srcObj[last];

                if (srcVal !== void 0 || required) {
                    if (validate && type)
                        type(name, srcVal);

                    destObj[last] = init ? init(name, srcVal) : srcVal;
                }
            }
        }
    }
}
