# Bubble Plugin — Patterns techniques essentiels

## 1. Structure obligatoire de `update.js`

Toujours utiliser cette structure pour éviter les boucles infinies et les renders inutiles :

```js
function(instance, properties, context) {

  // 1. TOUTES les properties en haut
  var myProp = properties.my_prop;

  // 2. Recursion protection
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {

    // 3. Guard : attendre que initialize.js soit terminé
    if (!instance.data.initialized) { return; }

    // 4. Mises à jour immédiates (CSS vars, date header...)
    //    → placées AVANT le hash check pour répondre instantanément

    // 5. Lecture et construction des données
    // ...

    // 6. Hash check → évite de rebâtir le DOM si rien n'a changé
    var hash = buildHash(...);
    if (instance.data.lastMasterHash === hash) { return; }
    instance.data.lastMasterHash = hash;

    // 7. Construction du DOM
    // ...

  } finally {
    instance.data.isUpdating = false;  // toujours reset, même si erreur
  }
}
```

**Pourquoi la recursion protection ?**
`instance.publishState()` peut déclencher un re-render Bubble qui rappelle `update.js` avant que le premier appel soit terminé → boucle infinie.

---

## 2. Guard `initialized`

Dans `initialize.js`, toujours terminer par :
```js
instance.data.initialized = true;
```

Dans `update.js`, toujours vérifier en premier :
```js
if (!instance.data.initialized) { return; }
```
Cela évite que `update.js` tourne partiellement avant que le DOM soit prêt.

---

## 3. Hash-based change detection

Calculer un hash string représentant l'état complet des données. Si identique au dernier hash → return immédiat, aucun DOM rebuild.

```js
var hash = 'date:' + (dayDate ? new Date(dayDate).toISOString().slice(0, 10) : 'null');
hash += '|count:' + itemCount;
hash += '|ids:' + items.map(function(i) { return i.get('_id'); }).join(',');

if (instance.data.lastMasterHash === hash) { return; }
instance.data.lastMasterHash = hash;
```

**Important :** les propriétés de layout (CSS vars) doivent être appliquées AVANT le hash check, car elles doivent répondre immédiatement sans attendre un changement de données.

---

## 4. Lecture de données Bubble (client-side)

### Lire une liste en tableau
```js
function readList(dataSource) {
  if (!dataSource || typeof dataSource.length !== 'function') { return null; }
  var len = dataSource.length();
  if (len === 0) { return []; }
  return dataSource.get(0, len);
}
```

### Construire un map `id → { object, name }`
```js
function buildMap(dataSource, nameField, map) {
  var items = readList(dataSource);
  if (!items) { return; }
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item || typeof item.get !== 'function') { continue; }
    var id = item.get('_id');
    if (id) {
      map[id] = { object: item, name: item.get(nameField) || '—' };
    }
  }
}
// Utilisation :
var personnelById = {};
buildMap(dataPersonnel, namePersonnel, personnelById);
// → personnelById['abc123'] = { object: bubbleObj, name: 'Jean Dupont' }
```

### Extraire des IDs depuis un champ relation (list ou single)
```js
function extractIds(sourceItem, fieldName) {
  if (!fieldName) { return []; }
  var ids = [];
  var ref = sourceItem.get(fieldName);
  if (!ref) { return ids; }
  if (typeof ref.length === 'function') {         // liste Bubble
    var items = ref.get(0, ref.length());
    for (var j = 0; j < items.length; j++) {
      if (items[j] && typeof items[j].get === 'function') {
        var id = items[j].get('_id');
        if (id) { ids.push(id); }
      }
    }
  } else if (ref && typeof ref.get === 'function') {  // objet single
    var id = ref.get('_id');
    if (id) { ids.push(id); }
  }
  return ids;
}
```

---

## 5. CSS custom properties pour layout dynamique

Pour les dimensions configurables par property Bubble, utiliser des CSS variables :

**Dans `initialize.js` (CSS) :**
```css
.monPlugin-${instanceId} .mon-element {
  width: var(--mon-plugin-width, 200px);   /* valeur par défaut en fallback */
}
```

**Dans `update.js` (AVANT le hash check) :**
```js
if (instance.data.container) {
  var w = (properties.ma_largeur > 0) ? properties.ma_largeur : 200;
  instance.data.container.style.setProperty('--mon-plugin-width', w + 'px');
}
```

Avantage : le layout répond instantanément quand la property change, sans attendre que le hash change et que le DOM soit reconstruit.

---

## 6. Structure de `initialize.js`

```js
function(instance, context) {

  // 1. Instance ID unique
  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'monPlugin-' + instanceId;
  instance.data.instanceId = instanceId;

  // 2. Injection CSS (scoped au instanceId)
  var style = document.createElement('style');
  style.innerHTML = `
    .monPlugin-${instanceId} {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      width: 100%;
      height: 100%;
    }
    /* ... toutes les règles CSS ... */
  `;
  document.head.appendChild(style);

  // 3. Construction DOM
  var container = document.createElement('div');
  container.className = 'monPlugin-' + instanceId;

  // 4. Helpers et event listeners

  // 5. Stockage des refs DOM dans instance.data
  instance.data.container = container;
  instance.data.monElement = monElement;

  // 6. Ajout au canvas
  instance.canvas.append(container);

  // 7. Flag initialized EN DERNIER
  instance.data.initialized = true;
}
```

---

## 7. Reverse map (lookup de relations inverses)

Quand on a besoin de chercher rapidement "quels X sont liés à ce Y ?", construire le map inverse une fois dans `update.js` et le stocker dans `instance.data` :

```js
// Exemple : conducteur → liste de véhicules dont il est conducteur
var conducteurToVehiculeIds = {};
for (var vid in vehiculeById) {
  var vObj = vehiculeById[vid].object;
  var c1 = vObj.get(fieldConducteur1);
  if (c1 && typeof c1.get === 'function') {
    var c1id = c1.get('_id');
    if (c1id) {
      if (!conducteurToVehiculeIds[c1id]) { conducteurToVehiculeIds[c1id] = []; }
      conducteurToVehiculeIds[c1id].push(vid);
    }
  }
}
instance.data.conducteurToVehiculeIds = conducteurToVehiculeIds;

// Dans les event handlers (initialize.js) :
var vehiculeIds = instance.data.conducteurToVehiculeIds[personnelId] || [];
```

---

## 8. Isolation CSS multi-instances

- Préfixer **toutes** les règles CSS : `.monPlugin-${instanceId} .ma-classe { ... }`
- Les `@keyframes` aussi : `@keyframes pulse-${instanceId} { ... }`
- Ne jamais utiliser de sélecteurs globaux (`:root`, `body`, `*`) dans le CSS du plugin

---

## 9. `instance.data` comme pont initialize ↔ update

- `initialize.js` crée et configure le DOM, stocke tout dans `instance.data`
- `update.js` lit les données Bubble, met à jour le DOM via `instance.data`
- Ne jamais recréer le DOM dans `update.js` si ce n'est pas nécessaire (hash check)
- Les fonctions helpers (`createTag`, `formatDate`, etc.) sont créées dans `initialize.js` et stockées dans `instance.data` pour être disponibles dans `update.js`
