@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\clean-css\bin\cleancss" %*
) ELSE (
  node  "%~dp0\..\clean-css\bin\cleancss" %*
)