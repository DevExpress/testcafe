import Assignable from '../../utils/assignable';


export default class ExtendedDialogCommand extends Assignable {
    constructor () {
        super();

        this.expectedDialogs = [];
    }
}
