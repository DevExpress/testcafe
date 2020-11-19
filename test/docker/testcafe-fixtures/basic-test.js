import { Selector } from 'testcafe';
import AboutBlankPage from './page-model/about-blank';

const aboutBlankPage = new AboutBlankPage();

fixture('Fixture');

test('test', async t => {
    await t
        .click(Selector('body'))
        .click(aboutBlankPage.body);
});
