@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\acorn\bin\acorn" %*
) ELSE (
  node  "%~dp0\..\acorn\bin\acorn" %*
)