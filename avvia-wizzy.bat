@echo off
echo ======================================
echo     🪄 Avvio Wizzy App - Expo Start
echo ======================================

cd /d "C:\Users\aless\curio-mia\frontend"
echo Pulizia cache e avvio in corso...

REM Avvia Expo con cache pulita
npx expo start -c

echo.
echo Premi un tasto per chiudere...
pause >nul
