@echo off
setlocal

chcp 932

pushd "%~dp0"
npm run dist
popd
