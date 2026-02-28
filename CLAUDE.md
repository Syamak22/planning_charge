# Bubble Web Plugin — Règles pour Claude

## Documentation détaillée (sous-docs)

| Fichier | Contenu |
|---|---|
| [docs/bubble-api.md](docs/bubble-api.md) | API complète : instance, properties, context, properties.bubble |
| [docs/patterns.md](docs/patterns.md) | Patterns : update.js, hash check, readList, buildMap, CSS vars, initialize.js |
| [docs/code-samples.md](docs/code-samples.md) | Exemples complets : initialize, update, preview, style, actions |
| [docs/server-actions.md](docs/server-actions.md) | Server-side async/await, normalisation des dates |
| [docs/lessons-learned.md](docs/lessons-learned.md) | Leçons apprises, pièges, patterns éprouvés (planning_hebdo) |
| [docs/libraries.md](docs/libraries.md) | Librairies externes : CDN, bundle React avec Vite/esbuild, intégration Bubble |

---

## Règles obligatoires

- **JavaScript et CSS uniquement** — pas de modules, pas de bundlers
- **Jamais `module.exports`**
- **Toutes les properties en haut du fichier** (avant tout code)
- **Toujours un `instanceId` unique** dans `initialize.js` :
  ```js
  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'monPlugin-' + instanceId;
  ```
- **Toujours hériter la typographie du host** :
  ```css
  .monPlugin-${instanceId} { font-family: inherit; font-size: inherit; color: inherit; width: 100%; height: 100%; }
  ```
- **Toutes les règles CSS préfixées** par `.monPlugin-${instanceId}` (isolation multi-instances)
- **Terminer `initialize.js` par** `instance.data.initialized = true;`

---

## Contrats des 4 fichiers

### `initialize.js` — s'exécute une seule fois au chargement
```js
function(instance, context) {
  // Créer le DOM, injecter le CSS, attacher les event listeners
  // Stocker les refs dans instance.data
  instance.data.initialized = true;  // toujours en dernier
}
```

### `update.js` — s'exécute à chaque re-render Bubble
```js
function(instance, properties, context) {
  // 1. Lire les properties en haut
  // 2. Recursion protection + guard initialized
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;
  try {
    if (!instance.data.initialized) { return; }
    // 3. Mises à jour immédiates (CSS vars avant le hash check)
    // 4. Lire les données, calculer le hash
    // if (instance.data.lastMasterHash === hash) { return; }
    // 5. Reconstruire le DOM
  } finally {
    instance.data.isUpdating = false;
  }
}
```
→ Voir [docs/patterns.md](docs/patterns.md) pour la structure complète et le hash check.

### `style.css` — toutes les règles CSS
```html
<style>
  /* Toujours scoper au nom de classe du plugin */
</style>
```

### `preview.js` — rendu simplifié dans l'éditeur Bubble
```js
function(instance, properties) {
  $(instance.canvas).empty().append('<div>Preview HTML ici</div>');
}
```

---

## API essentielle

### `instance`
```js
instance.canvas                          // div jQuery du conteneur
instance.publishState('name', value)     // publie un état vers Bubble
instance.triggerEvent('event_name')      // déclenche un event Bubble
instance.data.maVariable                 // stockage persistant entre initialize et update
```

### `properties`
```js
properties.ma_property    // valeur directe (String, Number, Date, Boolean)
properties.data_type      // list object → .length() et .get(start, count)
properties.bubble         // propriétés visuelles Bubble (voir docs/bubble-api.md)
```

### Objets Bubble
```js
// List object
var len = dataSource.length();           // synchrone en client-side
var items = dataSource.get(0, len);      // → Array

// Bubble object
var id   = item.get('_id');
var name = item.get('fieldName');
var isObj = typeof item.get === 'function';
```

### `context`
```js
context.currentUser.get('email')         // utilisateur connecté
context.uploadContent(name, base64, cb)  // upload vers Bubble Storage
context.keys                             // clés API définies dans le plugin editor
```
→ API complète dans [docs/bubble-api.md](docs/bubble-api.md)

---

## Publier un état / déclencher un event

```js
instance.publishState('selected_item', bubbleObj);
instance.publishState('count', 42);
instance.publishState('items_list', [obj1, obj2]);

instance.triggerEvent('item_selected');
```

---

## Lire une liste Bubble (pattern standard)

```js
function readList(dataSource) {
  if (!dataSource || typeof dataSource.length !== 'function') { return null; }
  var len = dataSource.length();
  return len === 0 ? [] : dataSource.get(0, len);
}

var items = readList(properties.data_type_personnel);
// items = null (non configuré) | [] (vide) | [obj, obj, ...]
```

---

## CSS custom properties pour layout dynamique

```js
// Dans update.js, AVANT le hash check :
instance.data.container.style.setProperty('--my-width', properties.width + 'px');

// Dans initialize.js CSS :
// .monPlugin-${instanceId} .element { width: var(--my-width, 200px); }
```

---

## Upload de fichier vers Bubble

```js
var reader = new FileReader();
reader.onload = function() {
  var base64 = reader.result.split('base64,')[1];
  context.uploadContent('fichier.png', base64, function(err, url) {
    if (!err && url) { instance.publishState('file_url', url); }
  });
};
reader.readAsDataURL(blob);
```

---

## Server-side actions — règles critiques

- Toujours `async function(properties, context)`
- `await` obligatoire sur `.length()`, `.get()`, `obj.get(field)`
- Normaliser les dates : `new Date(date.getTime() + 12 * 60 * 60 * 1000)` puis utiliser `getUTC*`

→ Voir [docs/server-actions.md](docs/server-actions.md) pour les patterns complets.

---

## Pièges à éviter (résumé)

1. **Relations** : pour accéder à un champ relationnel d'un type, prévoir une property Text séparée où le développeur saisit le nom du champ manuellement.
2. **`publishState` peut déclencher un re-render** → toujours protéger avec `isUpdating`.
3. **`dragData = null` avant `dragend`** → retirer les classes CSS avant de nullifier.
4. **`background: currentColor`** ne fonctionne pas avec `color: white !important` → hardcoder la couleur.
5. **`@keyframes` globaux** → inclure `instanceId` dans le nom.

→ Voir [docs/lessons-learned.md](docs/lessons-learned.md) pour tous les apprentissages détaillés.

---

## Date de dernière mise à jour

2026-02-26 — basé sur le plugin `planning_hebdo` (initialize2.js + update2.js)
