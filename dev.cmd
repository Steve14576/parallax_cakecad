@echo off
setlocal
set "NODE_HOME=%~dp0.tools\node-v24.20.0-win-x64"
set "PATH=%NODE_HOME%;%PATH%"
call "%NODE_HOME%\pnpm.cmd" dev
