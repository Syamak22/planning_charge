# Bubble Plugin — Leçons apprises (planning_hebdo)

Ces apprentissages sont issus de la construction du plugin `planning_hebdo`. Ils s'appliquent à tout futur plugin Bubble complexe.

---

## 1. Propriétés Bubble et champs relationnels

### Le piège des relations
Quand une property de type `data_type` référence un type Bubble dont les objets ont des **champs relationnels** (ex. un Véhicule a un champ "conducteur" de type User), le plugin ne peut PAS proposer un sélecteur de champ automatique pour ces relations.

**Solution :** toujours prévoir une **property de type Text** séparée pour chaque champ relationnel à accéder, dans laquelle le développeur saisit manuellement le nom exact du field Bubble.

```
// Dans le plugin editor Bubble :
// Property : field_conducteur_1  (type: Text)
// Le développeur saisit dans Bubble : "conductor_1" (nom exact du champ)

// Dans update.js :
var fieldConducteur1 = properties.field_conducteur_1;  // "conductor_1"
var c1 = vehicleObj.get(fieldConducteur1);  // → objet User ou null
```

### Tester si une valeur est un objet Bubble
```js
if (c1 && typeof c1.get === 'function') {
  var userId = c1.get('_id');
}
```

### Relation single vs liste
- **Single** : `obj.get('field')` → objet Bubble directement
- **Liste** : `obj.get('field')` → list object avec `.length()` et `.get()`
- Tester : `typeof ref.length === 'function'` → c'est une liste

---

## 2. Synchrone vs asynchrone

| Contexte | `.length()` | `.get()` | `obj.get()` |
|---|---|---|---|
| `update.js` (client) | synchrone ✓ | synchrone ✓ | synchrone ✓ |
| `initialize.js` (client) | synchrone ✓ | synchrone ✓ | synchrone ✓ |
| Server-side action | **async** → `await` | **async** → `await` | **async** → `await` |

---

## 3. Performance : hash-based change detection

Sur un plugin avec beaucoup de données (chantiers, personnel, véhicules, planning), reconstruire le DOM à chaque appel d'`update.js` est trop lent.

**Pattern adopté :** calculer un hash string de toutes les données lues → si identique au précédent → `return` immédiat.

```js
var hash = 'date:' + dayDate;
hash += '|personnel:' + Object.keys(personnelById).length;
hash += '|planning:' + planKeys.map(k => k + '=' + JSON.stringify(plan[k])).join('|');

if (instance.data.lastMasterHash === hash) { return; }
instance.data.lastMasterHash = hash;
```

**Astuce :** les propriétés qui contrôlent uniquement le layout (CSS vars) doivent être appliquées AVANT le hash check, pour répondre instantanément.

---

## 4. Récursivité et publishState

`instance.publishState()` peut déclencher un re-render Bubble qui rappelle `update.js` immédiatement → boucle infinie.

**Protection obligatoire :**
```js
if (instance.data.isUpdating) { return; }
instance.data.isUpdating = true;
try {
  // ... tout le code update ...
} finally {
  instance.data.isUpdating = false;
}
```

---

## 5. Drag & Drop — pièges courants

### `dragData = null` avant `dragend`
Le handler `drop` peut mettre `dragData` à `null` avant que `dragend` se déclenche. Si `dragend` dépend de `dragData`, il ne trouvera rien.

**Solution :** retirer toutes les classes CSS (`ph-dragging`, etc.) AVANT de nullifier `dragData` :
```js
// ❌ FAUX
if (isFromPool) { dragData = null; return; }

// ✓ CORRECT
if (isFromPool) { dragData.tag.classList.remove('ph-dragging'); dragData = null; return; }
```

### Mise à jour UI immédiate
Ne pas attendre le prochain cycle `update.js` pour mettre à jour des compteurs ou états visuels après un drag. Les mettre à jour directement dans les handlers `drop` et `click`.

---

## 6. CSS — pièges courants

### `currentColor` et `color` sur le même élément
```css
/* ❌ FAUX : background: currentColor lit la couleur de l'élément lui-même */
.badge { background: currentColor; color: white !important; }
/* → currentColor = white → badge blanc sur blanc */

/* ✓ CORRECT : hardcoder la couleur de fond */
.badge-blue { background: #3B82F6; color: white; }
.badge-green { background: #10B981; color: white; }
```

### `@keyframes` doivent être scopés à l'instance
```css
/* ❌ peut conflitter entre instances */
@keyframes pulse { ... }

/* ✓ nom unique par instance */
@keyframes pulse-${instanceId} { ... }
.element { animation: pulse-${instanceId} 1s infinite; }
```

### `opacity` sur un tag "indisponible" écrase tout
Utiliser `opacity: 0.5` avec une combinaison de `text-decoration: line-through` + couleurs neutres plutôt qu'une opacity seule (qui affecte aussi les enfants).

---

## 7. Architecture `instance.data`

**Ce qu'on stocke dans `instance.data` :**
- Références DOM (container, pools, zones, boutons)
- Fonctions helpers (`createTag`, `formatDate`, `createRow`)
- Lookups calculés (`conducteurToVehiculeIds`, `planningMap`)
- État courant (`currentDate`, `lastMasterHash`, `initialized`)
- Compteurs/badges DOM (`countPersonnel`, `countVehicule`)

**Ce qu'on ne stocke PAS :**
- Les données Bubble brutes (on les relit à chaque update.js)
- Des copies du state Bubble (source de désynchronisation)

---

## 8. Naming conventions des properties

Pour un plugin complexe avec beaucoup de propriétés, organiser par préfixe :

| Préfixe | Rôle | Exemple |
|---|---|---|
| `data_type_` | Liste d'objets Bubble | `data_type_personnel` |
| `name_display_` | Champ texte à afficher | `name_display_personnel` |
| `field_` | Nom de champ relationnel | `field_conducteur_1_vehicule` |
| `date_` / `field_date_` | Champ date | `date_debut_chantier` |
| Sans préfixe | Config layout/UI | `resources_panel_percent`, `chantier_col_width` |

---

## 9. Reverse map pour les relations inverses

Quand on veut "tous les véhicules dont X est conducteur", itérer sur tous les véhicules à chaque drag serait trop lent. Construire le map inverse une fois dans `update.js` :

```js
// Dans update.js : construction du reverse map
var conducteurToVehiculeIds = {};
for (var vid in vehiculeById) {
  var c1 = vehiculeById[vid].object.get(fieldConducteur1);
  if (c1 && typeof c1.get === 'function') {
    var cid = c1.get('_id');
    if (!conducteurToVehiculeIds[cid]) { conducteurToVehiculeIds[cid] = []; }
    conducteurToVehiculeIds[cid].push(vid);
  }
}
instance.data.conducteurToVehiculeIds = conducteurToVehiculeIds;

// Dans initialize.js (dragstart handler) :
var vehiculeIds = instance.data.conducteurToVehiculeIds[tag._resourceId] || [];
```

---

## 10. `_bubbleObject` et `_resourceId` sur les tags DOM

Pour permettre aux event handlers de retrouver l'objet Bubble associé à un élément DOM, stocker les références directement sur le nœud DOM :

```js
var tag = instance.data.createTag(name, type, removable);
tag._bubbleObject = bubbleObj;   // objet Bubble complet
tag._resourceId   = id;          // _id string pour les lookups

// Dans les handlers :
var obj = tag._bubbleObject;     // → passer à publishState directement
var id  = tag._resourceId;       // → chercher dans les maps
```
