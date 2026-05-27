@echo off
echo ====================================================
echo Pushing Automated Code Reviewer to GitHub...
echo ====================================================
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git command line utility was not found in your system PATH.
    echo.
    echo To resolve this:
    echo 1. Download and install Git from: https://git-scm.com/download/win
    echo 2. During installation, select "Git from the command line and also from 3rd-party software".
    echo 3. Restart your command prompt or editor.
    echo 4. Run this script again!
    echo.
    pause
    exit /b
)

echo [1/4] Initializing Git repository...
git init

echo [2/4] Adding remote repository...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/keerthisri-07/automated-code-reviewer.git
git branch -M main

echo [3/4] Adding and committing files...
git add .
git commit -m "Initial commit: Automated Code Reviewer backend and frontend"

echo [4/4] Pushing to main branch on GitHub...
git push -u origin main

echo ====================================================
echo SUCCESS! Your codebase has been pushed to GitHub.
echo Check it at: https://github.com/keerthisri-07/automated-code-reviewer
echo ====================================================
pause
