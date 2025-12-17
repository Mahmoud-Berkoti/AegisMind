@echo off
echo ============================================
echo   Pushing AegisMind to GitHub
echo ============================================
echo.
echo Repository: https://github.com/Mahmoud-Berkoti/AegisMind
echo.
echo This will push all your changes to GitHub.
echo You may be asked for GitHub credentials.
echo.
pause

cd /d "%~dp0"

echo.
echo Pushing to GitHub...
echo.

git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   SUCCESS! Your project is now on GitHub!
    echo ============================================
    echo.
    echo Visit: https://github.com/Mahmoud-Berkoti/AegisMind
    echo.
) else (
    echo.
    echo ============================================
    echo   Push failed. Please try one of these:
    echo ============================================
    echo.
    echo 1. Use GitHub Desktop (easiest)
    echo 2. Set up a Personal Access Token
    echo 3. Configure SSH keys
    echo.
    echo See GITHUB_AUTHENTICATION.md for help
    echo.
)

pause

