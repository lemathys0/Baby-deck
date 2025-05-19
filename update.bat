@echo off
:: Script pour mettre à jour un dépôt GitHub local

:: Aller dans le dossier du script (si lancé depuis ailleurs)
cd /d %~dp0

:: Affiche la branche active
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
echo Branche active : %branch%

:: Vérifie s’il y a des changements à committer
git status --porcelain > nul
if %errorlevel% neq 0 (
    echo [ERREUR] Le répertoire n'est pas un dépôt Git initialisé.
    pause
    exit /b
)

git diff --quiet && git diff --cached --quiet
if %errorlevel%==0 (
    echo Rien à committer. Le dépôt est à jour.
    pause
    exit /b
)

:: Demande un message de commit
set /p commitMsg=Entrez le message du commit :

:: Étapes Git
git add .
git commit -m "%commitMsg%"
git push origin %branch%

echo ---
echo ✅ Dépôt mis à jour avec succès !
pause
