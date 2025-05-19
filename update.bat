@echo off
:: Ce script met à jour le dépôt Git local et pousse sur GitHub
:: Assurez-vous d'être dans le dossier du projet Git

:: Étape 1 : Demande un message de commit
set /p commitMsg=Entrez le message du commit :

:: Étape 2 : Ajout de tous les fichiers modifiés
git add .

:: Étape 3 : Commit avec le message saisi
git commit -m "%commitMsg%"

:: Étape 4 : Push vers la branche principale (main ou master)
git push origin main

pause
