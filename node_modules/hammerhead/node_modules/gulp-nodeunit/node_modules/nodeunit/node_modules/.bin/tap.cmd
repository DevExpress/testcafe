@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\tap\bin\tap.js" %*
) ELSE (
  node  "%~dp0\..\tap\bin\tap.js" %*
)