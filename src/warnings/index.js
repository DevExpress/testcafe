import renderTemplate from '../utils/render-template';

export default class Warning {
    constructor () {
        this.message = renderTemplate.apply(null, arguments);
    }
}
