---
layout: docs
title: Reference
permalink: /documentation/reference/
---
# Reference

<!-- markdownlint-disable MD033 MD036 -->
<p style="font-size: 18px"><a href="command-line-interface.html">Command Line Interface</a></p>

<p style="font-size: 18px"><a href="configuration-file.html">Configuration File</a></p>
<!-- markdownlint-enable MD033 -->

**Test API**

*Global Functions*

* [fixture](test-api/global/fixture.md)
* [test](test-api/global/test.md)

*[ClientFunction](test-api/clientfunction/README.md)*

* [ClientFunction Constructor](test-api/clientfunction/constructor.md)
* [with](test-api/clientfunction/with.md)

*[DOMNodeState](test-api/domnodestate.md)*

*Fixture*

* [after](test-api/fixture/after.md)
* [afterEach](test-api/fixture/aftereach.md)
* [before](test-api/fixture/before.md)
* [beforeEach](test-api/fixture/beforeeach.md)
* [clientScripts](test-api/fixture/clientscripts.md)
* [disablePageCaching](test-api/fixture/disablepagecaching.md)
* [httpAuth](test-api/fixture/httpauth.md)
* [meta](test-api/fixture/meta.md)
* [only](test-api/fixture/only.md)
* [page](test-api/fixture/page.md)
* [requestHooks](test-api/fixture/requesthooks.md)
* [skip](test-api/fixture/skip.md)

*[RequestHook](test-api/requesthook/README.md)*

* [RequestHook Constructor](test-api/requesthook/constructor.md)
* [onRequest](test-api/requesthook/onrequest.md)
* [onResponse](test-api/requesthook/onresponse.md)

*[RequestLogger](test-api/requestlogger/README.md)*

* [RequestLogger Constructor](test-api/requestlogger/constructor.md)
* [clear](test-api/requestlogger/clear.md)
* [contains](test-api/requestlogger/contains.md)
* [count](test-api/requestlogger/count.md)
* [requests](test-api/requestlogger/requests.md)

*[RequestMock](test-api/requestmock/README.md)*

* [RequestMock Constructor](test-api/requestmock/constructor.md)
* [onRequestTo](test-api/requestmock/onrequestto.md)
* [respond](test-api/requestmock/respond.md)

*Role*

* [Role Constructor](test-api/role/constructor.md)
* [anonymous Static](test-api/role/anonymous.md)

*[Selector](test-api/selector/README.md)*

* [Selector constructor](test-api/selector/constructor.md)
* [addCustomDOMProperties](test-api/selector/addcustomdomproperties.md)
* [addCustomMethods](test-api/selector/addcustommethods.md)
* [child](test-api/selector/child.md)
* [count](test-api/selector/count.md)
* [exists](test-api/selector/exists.md)
* [filter](test-api/selector/filter.md)
* [filterHidden](test-api/selector/filterhidden.md)
* [filterVisible](test-api/selector/filtervisible.md)
* [find](test-api/selector/find.md)
* [nextSibling](test-api/selector/nextsibling.md)
* [nth](test-api/selector/nth.md)
* [parent](test-api/selector/parent.md)
* [prevSibling](test-api/selector/prevsibling.md)
* [sibling](test-api/selector/sibling.md)
* [with](test-api/selector/with.md)
* [withAttribute](test-api/selector/withattribute.md)
* [withExactText](test-api/selector/withexacttext.md)
* [withText](test-api/selector/withtext.md)

*Test*

* [after](test-api/test/after.md)
* [before](test-api/test/before.md)
* [clientScripts](test-api/test/clientscripts.md)
* [disablePageCaching](test-api/test/disablepagecaching.md)
* [httpAuth](test-api/test/httpauth.md)
* [meta](test-api/test/meta.md)
* [only](test-api/test/only.md)
* [page](test-api/test/page.md)
* [requestHooks](test-api/test/requesthooks.md)
* [skip](test-api/test/skip.md)

*[TestController](test-api/testcontroller/README.md)*

* [addRequestHooks](test-api/testcontroller/addrequesthooks.md)
* [browser](test-api/testcontroller/browser.md)
* [clearUpload](test-api/testcontroller/clearupload.md)
* [click](test-api/testcontroller/click.md)
* [ctx](test-api/testcontroller/ctx.md)
* [debug](test-api/testcontroller/debug.md)
* [doubleClick](test-api/testcontroller/doubleclick.md)
* [drag](test-api/testcontroller/drag.md)
* [dragToElement](test-api/testcontroller/dragtoelement.md)
* [eval](test-api/testcontroller/eval.md)
* [expect](test-api/testcontroller/expect/README.md)
  * [contains](test-api/testcontroller/expect/contains.md)
  * [eql](test-api/testcontroller/expect/eql.md)
  * [gt](test-api/testcontroller/expect/gt.md)
  * [gte](test-api/testcontroller/expect/gte.md)
  * [lt](test-api/testcontroller/expect/lt.md)
  * [lte](test-api/testcontroller/expect/lte.md)
  * [match](test-api/testcontroller/expect/match.md)
  * [notcontains](test-api/testcontroller/expect/notcontains.md)
  * [noteql](test-api/testcontroller/expect/noteql.md)
  * [notmatch](test-api/testcontroller/expect/notmatch.md)
  * [notok](test-api/testcontroller/expect/notok.md)
  * [nottypeof](test-api/testcontroller/expect/nottypeof.md)
  * [notwithin](test-api/testcontroller/expect/notwithin.md)
  * [ok](test-api/testcontroller/expect/ok.md)
  * [typeof](test-api/testcontroller/expect/typeof.md)
  * [within](test-api/testcontroller/expect/within.md)
* [fixtureCtx](test-api/testcontroller/fixturectx.md)
* [getBrowserConsoleMessages](test-api/testcontroller/getbrowserconsolemessages.md)
* [getNativeDialogHistory](test-api/testcontroller/getnativedialoghistory.md)
* [hover](test-api/testcontroller/hover.md)
* [maximizeWindow](test-api/testcontroller/maximizewindow.md)
* [navigateTo](test-api/testcontroller/navigateto.md)
* [pressKey](test-api/testcontroller/presskey.md)
* [removeRequestHooks](test-api/testcontroller/removerequesthooks.md)
* [resizeWindow](test-api/testcontroller/resizewindow.md)
* [resizeWindowToFitDevice](test-api/testcontroller/resizewindowtofitdevice.md)
* [rightClick](test-api/testcontroller/rightclick.md)
* [selectEditableContent](test-api/testcontroller/selecteditablecontent.md)
* [selectText](test-api/testcontroller/selecttext.md)
* [selectTextAreaContent](test-api/testcontroller/selecttextareacontent.md)
* [setFilesToUpload](test-api/testcontroller/setfilestoupload.md)
* [setNativeDialogHandler](test-api/testcontroller/setnativedialoghandler.md)
* [setPageLoadTimeout](test-api/testcontroller/setpageloadtimeout.md)
* [setTestSpeed](test-api/testcontroller/settestspeed.md)
* [switchToIframe](test-api/testcontroller/switchtoiframe.md)
* [switchToMainWindow](test-api/testcontroller/switchtomainwindow.md)
* [takeElementScreenshot](test-api/testcontroller/takeelementscreenshot.md)
* [takeScreenshot](test-api/testcontroller/takescreenshot.md)
* [typeText](test-api/testcontroller/typetext.md)
* [useRole](test-api/testcontroller/userole.md)
* [wait](test-api/testcontroller/wait.md)

**TestCafe API**

* [createTestCafe Function](testcafe-api/global/createtestcafe.md)

*[BrowserConnection](testcafe-api/browserconnection/README.md)*

* [ready](testcafe-api/browserconnection/ready.md)
* [url](testcafe-api/browserconnection/url.md)

*[LiveModeRunner](testcafe-api/livemoderunner.md)*

*[Runner](testcafe-api/runner/README.md)*

* [browsers](testcafe-api/runner/browsers.md)
* [clientScripts](testcafe-api/runner/clientscripts.md)
* [concurrency](testcafe-api/runner/concurrency.md)
* [filter](testcafe-api/runner/filter.md)
* [reporter](testcafe-api/runner/reporter.md)
* [run](testcafe-api/runner/run.md)
* [screenshots](testcafe-api/runner/screenshots.md)
* [src](testcafe-api/runner/src.md)
* [startApp](testcafe-api/runner/startapp.md)
* [stop](testcafe-api/runner/stop.md)
* [tsConfigPath](testcafe-api/runner/tsconfigpath.md)
* [useProxy](testcafe-api/runner/useproxy.md)
* [video](testcafe-api/runner/video.md)

*[TestCafe](testcafe-api/testcafe/README.md)*

* [close](testcafe-api/testcafe/close.md)
* [createBrowserConnection](testcafe-api/testcafe/createbrowserconnection.md)
* [createLiveModeRunner](testcafe-api/testcafe/createlivemoderunner.md)
* [createRunner](testcafe-api/testcafe/createrunner.md)
