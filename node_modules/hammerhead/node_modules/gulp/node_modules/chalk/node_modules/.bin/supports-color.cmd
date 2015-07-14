@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\supports-color\cli.js" %*
) ELSE (
  node  "%~dp0\..\supports-color\cli.js" %*
)