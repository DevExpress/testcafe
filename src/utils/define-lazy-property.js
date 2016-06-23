export default function defineLazyProperty (obj, propName, initializer) {
    Object.defineProperty(obj, propName, {
        propValue: null,

        get () {
            if (!this.propValue)
                this.propValue = initializer();

            return this.propValue;
        }
    });
}
