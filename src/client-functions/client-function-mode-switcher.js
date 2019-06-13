export default {
    asyncMode: true,

    enableSync () {
        this.asyncMode = false;
    },

    disableSync () {
        this.asyncMode = true;
    }
}
