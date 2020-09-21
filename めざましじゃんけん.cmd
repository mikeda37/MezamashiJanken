@echo off
setlocal

chcp 932

pushd "%~dp0"
SET WEEK="this"
SET /P KEYWORD="Keyword:"
SET PREF_PATH=%APPDATA%\mezamashi_janken\preferences.json
node scripts\janken.js %WEEK% %KEYWORD% %PREF_PATH%
popd

pause

