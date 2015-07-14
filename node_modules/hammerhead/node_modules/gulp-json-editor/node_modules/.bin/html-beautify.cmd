@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\js-beautify\js\bin\html-beautify.js" %*
) ELSE (
  node  "%~dp0\..\js-beautify\js\bin\html-beautify.js" %*
)