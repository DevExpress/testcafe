@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\strip-ansi\cli.js" %*
) ELSE (
  node  "%~dp0\..\strip-ansi\cli.js" %*
)