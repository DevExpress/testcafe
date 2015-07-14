@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\jshint\bin\jshint" %*
) ELSE (
  node  "%~dp0\..\jshint\bin\jshint" %*
)