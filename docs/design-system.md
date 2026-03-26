# Design System — Plugins Bubble

> Style de référence établi sur le plugin **Planning des Absences**.
> À réutiliser tel quel pour tous les futurs plugins.

---

## 1. Philosophie de design

### Principes directeurs
- **Clarté avant tout** — chaque zone a un rôle visuel immédiat (navigation, données, actions).
- **Hiérarchie par le fond** — le fond global est gris clair, les cartes de contenu sont blanches. La profondeur crée la structure sans ombre lourde.
- **Couleur fonctionnelle** — la couleur primaire est réservée aux éléments d'action et aux labels de section. Elle ne décore pas, elle oriente.
- **Typographie héritée** — les plugins s'intègrent dans l'app Bubble sans imposer une typo étrangère (`font-family: inherit` sur le conteneur racine), mais on précise `Inter` en fallback.

---

## 2. Palette de couleurs

### Couleurs de marque (à adapter par projet)
```
Primary          #f20d0d   → boutons CTA, labels de section, titres de colonnes
Primary Light    #fd6c70   → hover sur le bouton CTA
Primary Contrast #fef2f2   → hover sur les boutons secondaires (fond très clair)
```

### Neutrals (invariants entre projets)
```
Fond global      #F1F5F9   → background du conteneur principal (gris bleuté très doux)
Surface blanche  #ffffff   → cartes, sidebar, calendrier
Texte principal  #1e293b   → texte de contenu, titres
Texte secondaire #64748B   → numéros de jour, placeholders, chevrons
Texte effacé     #CBD5E1   → jours hors mois, infos désactivées
Fond hors-mois   #FAFAFA   → cellules de jours d'un autre mois
Bordure          #e2e8f0   → toutes les bordures (cartes, séparateurs, inputs)
```

### Couleurs sémantiques (réutilisables pour statuts, tags, badges)
```
Bleu    color #3B82F6  bg #EFF6FF  border #BFDBFE  → Congés / info
Violet  color #8B5CF6  bg #F5F3FF  border #DDD6FE  → Formation / secondaire
Rouge   color #EF4444  bg #FEF2F2  border #FECACA  → Arrêt / danger / erreur
Ambre   color #F59E0B  bg #FFFBEB  border #FDE68A  → Non justifié / warning
Vert    color #10B981  bg #ECFDF5  border #A7F3D0  → Visite médicale / succès
Slate   color #475569  bg #F8FAFC  border #CBD5E1  → Autre / neutre
```

> **Règle** : chaque couleur sémantique a toujours trois déclinaisons — `color` (texte/dot), `bg` (fond du badge), `border` (contour). Ne jamais utiliser `color` seul comme fond.

---

## 3. Typographie

### Police
```
font-family: Inter, sans-serif
```
Inter est la police de référence. Elle est lisible à toutes les tailles, neutre et professionnelle. En l'absence d'Inter, `sans-serif` prend le relais proprement.

### Échelle de tailles
```
10px  font-weight: 700  letter-spacing: 0.08em  UPPERCASE  → labels de section (COLLABORATEUR, LÉGENDE)
11px  font-weight: 700  letter-spacing: 0.06em  UPPERCASE  → noms de colonnes (LUN, MAR...)
12px  font-weight: 500                           → numéros de jour, texte de base
13px  font-weight: 400 / 600                    → contenu (select, boutons, légende)
16px  font-weight: 700                           → titre principal (mois courant)
```

### Labels de section (pattern récurrent)
Les titres de zone (COLLABORATEUR, LÉGENDE DES ABSENCES) utilisent systématiquement :
```css
font-size: 10px;
font-weight: 700;
color: [PRIMARY];
text-transform: uppercase;
letter-spacing: 0.08em;
```
C'est le seul endroit où la couleur primaire est utilisée comme couleur de texte.

---

## 4. Layout & Espacement

### Structure générale d'un plugin en pleine page
```
┌─────────────────────────────────────────────────────────┐
│  FOND GLOBAL #F1F5F9  padding: 16px  gap: 12px          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  TOPBAR  (carte blanche)                        │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────────────────────┐    │
│  │  SIDEBAR     │  │  ZONE PRINCIPALE              │    │
│  │  (carte)     │  │  (carte)                      │    │
│  └──────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Valeurs d'espacement
```
padding conteneur global  16px
gap entre cartes          12px
padding interne carte      16px – 20px
padding cellule calendrier 8px 6px
gap entre badges           4px
gap icon + texte           5px (badge), 8–10px (légende)
```

### Largeurs fixes
```
Sidebar légende  210px  (flex-shrink: 0)
Dropdown collab  200px min-width
Boutons nav mois 32×32px
```

---

## 5. Roundness Bubble & fond du plugin

### Problème
Dans Bubble, le "Roundness" d'un élément plugin est appliqué par Bubble sur son **wrapper externe** — pas sur le contenu du plugin. Résultat : même avec un Roundness à 5 dans l'éditeur Bubble, les coins du plugin ne sont pas arrondis visuellement car le contenu (cartes blanches) déborde.

### Solution : `border-radius: inherit`
Le conteneur racine du plugin doit hériter du border-radius de son parent Bubble :
```css
.monPlugin-instanceId {
  border-radius: inherit;  /* ← hérite du roundness Bubble */
  overflow: hidden;        /* ← clip le contenu aux coins arrondis */
}
```
Dans nos plugins, c'est déjà intégré dans le style du `wrap` (le conteneur racine `.planningAbsence-xxx`).

### Fond du plugin (couleur modifiable)
Le fond global du plugin est défini **en haut du fichier `initialize.js`** (et dans `preview.js`), dans le style du conteneur `wrap` :
```js
// initialize.js — ligne ~43
// ↓ Modifier cette valeur pour changer le fond
background: #F1F5F9;
```
Valeurs courantes :
```
#ffffff   → blanc pur (défaut)
transparent → le fond de l'app Bubble transparaît
#F1F5F9   → gris bleuté très doux
```

---

## 6. Cartes (Surface blanche)

### Pattern standard
```css
background: #ffffff;
border-radius: 5px;
border: 1px solid #e2e8f0;
padding: 16px;
```
Pas de `box-shadow`. La bordure suffit à différencier du fond gris.
`border-radius: 5px` sur tous les éléments — coins sobres et professionnels.

---

## 6. Boutons

### Bouton CTA primaire (ex : "+ Nouvelle Absence")
```css
background: [PRIMARY];         /* #f20d0d */
color: #ffffff;
border: none;
border-radius: 5px;
padding: 10px 18px;
font-size: 13px;
font-weight: 600;
cursor: pointer;
transition: background 0.15s;
/* hover → */
background: [PRIMARY_LIGHT];   /* #fd6c70 */
```

### Bouton secondaire / icône (ex : navigation mois)
```css
background: none;
border: 1px solid #e2e8f0;
border-radius: 5px;
width: 32px; height: 32px;
color: [PRIMARY];
font-size: 18px;
cursor: pointer;
transition: background 0.15s;
/* hover → */
background: #fef2f2;           /* PRIMARY_CONTRAST */
```

> **Règle hover** : CTA → assombrir/éclaircir la couleur. Secondaire → fond très clair de la couleur primaire.

---

## 7. Inputs & Select

### Select natif stylisé
```css
border: 1px solid #e2e8f0;
border-radius: 5px;
padding: 8px 28px 8px 12px;
font-size: 13px;
font-family: inherit;
color: #1e293b;
background: #fff url("chevron SVG encodé") no-repeat right 10px center;
appearance: none;
outline: none;
/* focus → */
border-color: [PRIMARY_LIGHT];
```

Le chevron en SVG encodé en base64/URL permet de remplacer la flèche native sans dépendance externe :
```
url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
```

---

## 8. Badges / Étiquettes

Utilisés pour les statuts, tags, types. Pattern tiré des absences mais applicable partout.

```css
display: inline-flex;
align-items: center;
gap: 5px;
padding: 3px 8px;
border-radius: 5px;          /* pill */
font-size: 9px;
font-weight: 700;
letter-spacing: 0.04em;
text-transform: uppercase;
background: [couleur.bg];
color: [couleur.color];
border: 1px solid [couleur.border];
cursor: pointer;
transition: opacity 0.15s;
/* hover → */
opacity: 0.75;
```

### Point coloré dans le badge
```css
width: 6px; height: 6px;
border-radius: 50%;
background: [couleur.color];
flex-shrink: 0;
```

### Règle de contenu
- Texte en MAJUSCULES, court (≤ 15 caractères)
- Maximum 2 badges par cellule de calendrier
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` sur le texte

---

## 9. Grille calendrier

### En-tête des jours
```css
display: grid;
grid-template-columns: repeat(7, 1fr);
border-bottom: 2px solid #e2e8f0;   /* 2px pour marquer la séparation header/body */
```

Noms de colonnes : `font-size: 11px; font-weight: 700; color: [PRIMARY]; text-transform: uppercase;`
Séparateur vertical entre colonnes : `border-right: 1px solid #e2e8f0;` (sauf dernière colonne).

### Cellules
```css
padding: 8px 6px;
min-height: 80px;
display: flex;
flex-direction: column;
gap: 4px;
border-right: 1px solid #e2e8f0;
```

Cellule hors-mois :
```css
background: #FAFAFA;
/* numéro de jour → color: #CBD5E1 */
```

### Calcul du premier jour (Lundi = 0)
```js
var startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
// getDay() retourne 0=Dim, 1=Lun... → +6 %7 ramène Lundi à 0
```

---

## 10. Sidebar / Légende

Structure répétable pour toute légende ou liste de filtres :

```html
<div class="sidebar">
  <div class="legend-title">Titre section</div>
  <div class="legend-item">
    <div class="dot" style="background: [color]"></div>
    <span>Label</span>
  </div>
  ...
</div>
```

```css
.legend-title  → voir §3 "Labels de section"
.legend-item   → padding: 8px 10px; border-radius: 5px; gap: 10px; font-size: 13px;
.dot           → width/height: 12px; border-radius: 50%;
```

Le `border-radius: 8px` sur chaque item permet d'ajouter un état hover/actif proprement :
```css
.legend-item:hover { background: #F1F5F9; cursor: pointer; }
.legend-item.active { background: #fef2f2; }
```

---

## 11. Checklist d'intégration dans un nouveau plugin

- [ ] Définir `PRIMARY`, `PRIMARY_LIGHT`, `PRIMARY_CONTRAST` en variables en haut du fichier
- [ ] Fond global `#F1F5F9`, cartes blanches avec `border: 1px solid #e2e8f0; border-radius: 5px`
- [ ] Police `Inter, sans-serif` + `font-size: 12px` sur le conteneur racine
- [ ] Labels de section : 10px, bold, uppercase, lettre-spacing 0.08em, couleur primary
- [ ] Tous les `border-radius` à `5px` — cartes, boutons, inputs, badges, items de légende
- [ ] Badges : palette sémantique à 3 valeurs (color/bg/border), `border-radius: 5px`
- [ ] Hover CTA → `PRIMARY_LIGHT`, hover secondaire → `PRIMARY_CONTRAST`
- [ ] Transitions : `0.15s` sur `background`, `opacity` pour les éléments interactifs

---

*Dernière mise à jour : 2026-03-18 — Planning Absence plugin*
