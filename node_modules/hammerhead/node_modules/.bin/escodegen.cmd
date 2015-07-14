@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\escodegen\bin\escodegen.js" %*
) ELSE (
  node  "%~dp0\..\escodegen\bin\escodegen.js" %*
)