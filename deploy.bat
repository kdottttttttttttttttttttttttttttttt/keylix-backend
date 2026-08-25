@echo off
echo === Keylix - One Click Deploy to Render (Free, no card) ===
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
  echo [!] Git not found. Install from https://git-scm.com/downloads
  pause
  exit /b
)

if not exist ".git" (
  echo [+] Init git...
  git init
  git add .
  git commit -m "keylix c2s2"
  git branch -M main
) else (
  echo [+] Git already init, updating...
  git add .
  git commit -m "update" 2>nul
)

echo.
echo === GitHub ===
echo 1. Go to https://github.com/new
echo 2. Repo name: keylix-backend (public, no README)
echo 3. Click Create, then copy the URL like https://github.com/YOURNAME/keylix-backend.git
echo.
set /p REPO_URL="Paste your GitHub repo URL here: "

if "%REPO_URL%"=="" (
  echo [!] No URL pasted. Exiting.
  pause
  exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo [+] Pushing to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
  echo.
  echo [!] Push failed - maybe need login.
  echo     Try: git push -u origin main  (will ask for GitHub login in browser)
  echo     Or install GitHub CLI: https://cli.github.com/
  pause
  exit /b
)

echo.
echo === DONE! Now deploy to Render ===
echo 1. Go to https://dashboard.render.com
echo 2. Click New + -> Web Service -> Connect %REPO_URL%
echo 3. Build: npm install   Start: npm start   Plan: Free -> Create
echo 4. After it gives you https://keylix-xxxx.onrender.com  -> set in Launcher > Settings > Backend URL
echo.
echo Or use 1-click: https://render.com/deploy?repo=%REPO_URL%
echo.
echo Keep it awake: https://uptimerobot.com -> Add monitor https://your-render-url/ every 5 min
echo.
pause
