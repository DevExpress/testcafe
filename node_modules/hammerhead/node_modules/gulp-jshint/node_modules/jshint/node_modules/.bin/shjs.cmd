@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\shelljs\bin\shjs" %*
) ELSE (
  node  "%~dp0\..\shelljs\bin\shjs" %*
)