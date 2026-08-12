# Lovable Default Theme Setup

Ce fichier documente la procédure pour appliquer et publier le thème par défaut "Menthe Vibrant Cyber" dans un repo Lovable.

## Objectif

Assurer que le projet actif utilise la bonne configuration de thème et que celle-ci soit réutilisable depuis un autre dépôt.

## Fichiers concernés

- `src/components/ThemeBubble.tsx`
- `frontend/src/components/ThemeBubble.tsx`

## Thème choisi

- `DEFAULT_THEME_ID = "mint-vibrant-cyber"`

## Branches de publication

Le projet Lovable actuel surveille la branche :
- `conflict_290726_1841`

## Script d'application

Un script est fourni pour appliquer rapidement le thème par défaut :

```bash
bash scripts/apply-lovable-default-theme.sh [branch]
```

### Exemple

```bash
bash scripts/apply-lovable-default-theme.sh conflict_290726_1841
```

## Ce que fait le script

1. Bascule sur la branche spécifiée (par défaut `conflict_290726_1841`).
2. Met à jour les fichiers `ThemeBubble.tsx` suivants si nécessaire :
   - `src/components/ThemeBubble.tsx`
   - `frontend/src/components/ThemeBubble.tsx`
3. Commit les changements avec le message :
   - `Apply Lovable default theme: mint-vibrant-cyber`
4. Pousse la branche vers `origin`.

## Instructions pour un nouveau repo

1. Clonez le dépôt :
   ```bash
git clone git@github.com:lijk7677-dev/lovanet-fr.git
cd lovanet-fr
```
2. Exécutez le script :
   ```bash
bash scripts/apply-lovable-default-theme.sh conflict_290726_1841
```
3. Vérifiez que les fichiers ont bien été modifiés :
   ```bash
git diff -- src/components/ThemeBubble.tsx frontend/src/components/ThemeBubble.tsx
```
4. Publiez le repo avec Lovable.

## Notes

- Si votre déploiement utilise uniquement `src/`, le réglage dans `frontend/src/` est un doublon sans effet direct. Le script garde les deux fichiers à jour pour couvrir les deux configurations possibles.
- Si Lovable surveille une autre branche, passez cette branche en argument du script.
