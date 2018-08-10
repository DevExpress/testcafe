import { Selector, Role, t } from 'testcafe'

iframeElement = Selector '#element-in-iframe'
pageElement = Selector '#element-on-page'
showAlertBtn = Selector '#show-alert'

initConfiguration = ->
    await t
        .setNativeDialogHandler => on
        .click showAlertBtn

    history = await t.getNativeDialogHistory()

    await t
        .expect(history[0].text).eql 'Hey!'
        .switchToIframe '#iframe'
        .expect(iframeElement.exists).ok()
        .setTestSpeed 0.95
        .setPageLoadTimeout 95

    t.ctx['someVal'] = 'ctxVal'
    t.fixtureCtx['someVal'] = 'fixtureCtxVal'

role1 = Role 'http://localhost:3000/fixtures/api/es-next/roles/pages/index.html', =>
    await t
        .setNativeDialogHandler => on

    await t
        .expect(pageElement.exists).ok()
        .expect(t.ctx['someVal']).notOk()
        .expect(t.fixtureCtx['someVal']).notOk()

    await t.click showAlertBtn

role2 = Role 'http://localhost:3000/fixtures/api/es-next/roles/pages/index.html', =>

fixture 'CoffeeScript smoke tests'
    .page 'http://localhost:3000/fixtures/api/es-next/roles/pages/index.html'

test 'Clear configuration', =>
    await initConfiguration()
    await t.useRole role1

test 'Restore configuration', =>
    await initConfiguration()

    await t
        .useRole role2
        .expect(iframeElement.exists).ok()
        .expect(t.ctx['someVal']).eql 'ctxVal'
        .expect(t.fixtureCtx['someVal']).eql 'fixtureCtxVal'

    await t
        .switchToMainWindow()
        .click showAlertBtn

    history = await t.getNativeDialogHistory()

    await t.expect(history[0].text).eql 'Hey!'
