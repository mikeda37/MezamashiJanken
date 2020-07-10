@echo off
setlocal

pushd "%~dp0"
SET WEEK="this"
SET /P KEYWORD="Keyword:"
node scripts\janken.js %WEEK% %KEYWORD%
popd

pause

