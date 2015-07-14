@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\less\bin\lessc" %*
) ELSE (
  node  "%~dp0\..\less\bin\lessc" %*
)