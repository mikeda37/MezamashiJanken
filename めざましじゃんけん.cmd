@echo off
set CURRENT_DIR=%~dp0

SET /P keyword="Keyword:"

node "%CURRENT_DIR%janken.js" %keyword%

pause
