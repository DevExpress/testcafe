@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\ycssmin\bin\cssmin" %*
) ELSE (
  node  "%~dp0\..\ycssmin\bin\cssmin" %*
)