@echo off
setlocal

chcp 932

pushd "%~dp0"
SET WEEK="this"
SET /P KEYWORD="Keyword:"
node scripts\janken.js %WEEK% %KEYWORD%
popd

pause

