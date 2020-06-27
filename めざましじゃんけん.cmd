@echo off
setlocal

pushd "%~dp0"
SET /P keyword="Keyword:"
node scripts\janken.js %keyword%
popd

pause

