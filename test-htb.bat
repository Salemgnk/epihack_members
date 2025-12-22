@echo off
REM Test HTB API Script
echo Testing HTB API endpoints...

REM Read HTB token from .env.local
for /f "tokens=2 delims==" %%a in ('findstr "HTB_APP_TOKEN" .env.local') do set HTB_APP_TOKEN=%%a

node test-htb-api.mjs
