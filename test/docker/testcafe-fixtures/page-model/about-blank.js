import { Selector } from 'testcafe';

class AboutBlankPage {
    get body () {
        return Selector('body');
    }
}

export default AboutBlankPage;
