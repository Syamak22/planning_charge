# Bubble Plugin — Utiliser des librairies externes

Bubble n'accepte pas les packages npm directement. Deux approches selon le cas.

---

## Approche 1 : CDN (simple, librairie légère)

Charger la librairie via un `<script>` tag dans `initialize.js`, puis attendre qu'elle soit disponible avant de l'utiliser.

```js
function(instance, context) {
  function loadScript(url, callback) {
    var script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = function() { console.error('Échec chargement:', url); };
    document.head.appendChild(script);
  }

  loadScript('https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js', function() {
    instance.data.Chart = window.Chart;
    instance.data.initialized = true;
  });
}
```

**Recommandé pour :** Chart.js, Sortable, Flatpickr — librairies sans dépendances complexes.

**Limites :**
- Dépend d'un réseau externe (CDN down = plugin cassé)
- Pas adapté à React ou aux librairies avec dépendances multiples

---

## Approche 2 : Bundle esbuild (recommandé pour React et librairies complexes)

### Principe

Créer un projet local avec **esbuild** → produire un seul fichier `bundle.iife.js` → l'héberger → le charger dans `initialize.js`.

Esbuild est un bundler simple et rapide. Pas de serveur de dev, pas de hot reload — juste : prendre des fichiers JS/JSX, les bundler en un seul fichier optimisé.

### Setup

**1. Créer le projet**
```bash
mkdir mon-bundle && cd mon-bundle
npm init -y
npm install --save-dev esbuild
npm install react react-dom
```

**2. Configurer `build.js`**
```js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.jsx'],
  bundle: true,
  format: 'iife',          // s'exécute immédiatement, expose via globalName
  globalName: 'MonPlugin', // disponible en window.MonPlugin
  outfile: 'dist/bundle.iife.js',
  minify: true,
  jsx: 'automatic',        // React 17+ (pas besoin d'importer React)
}).catch(() => process.exit(1));
```

**3. Point d'entrée `src/index.jsx`**
```jsx
import { createRoot } from 'react-dom/client';
import App from './App';

window.MonPlugin = {
  init: function(containerId, props, callbacks) {
    var container = document.getElementById(containerId);
    if (!container) { return null; }
    var root = createRoot(container);
    root.render(<App initialProps={props} callbacks={callbacks} />);
    return root;
  },
  update: function(root, newProps) {
    // Appeler depuis update.js pour mettre à jour les props React
  }
};
```

**4. Construire le bundle**
```bash
node build.js
# → dist/bundle.iife.js (fichier unique à héberger)
```

**5. Héberger le bundle**
- Option A : uploader sur Bubble via `context.uploadContent()` une seule fois, stocker l'URL
- Option B : héberger sur un CDN externe (GitHub Pages, Cloudflare, etc.)
- Option C : encoder en base64 et inliner dans `initialize.js` (uniquement si < ~500 KB)

---

## Intégration dans initialize.js

```js
function(instance, context) {
  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceId = instanceId;

  var container = document.createElement('div');
  container.id = 'plugin-' + instanceId;
  container.style.width = '100%';
  container.style.height = '100%';
  instance.canvas.append(container);
  instance.data.container = container;

  var bundleUrl = context.keys.bundle_url || 'https://mon-cdn.com/bundle.iife.js';

  function onBundleReady() {
    instance.data.root = window.MonPlugin.init(
      'plugin-' + instanceId,
      {},
      { onEvent: function(name, data) { handleEvent(name, data); } }
    );
    instance.data.initialized = true;
  }

  // Charger le bundle une seule fois pour toute la page
  if (window.MonPlugin) {
    onBundleReady();
  } else {
    var script = document.createElement('script');
    script.src = bundleUrl;
    script.onload = onBundleReady;
    document.head.appendChild(script);
  }

  function handleEvent(name, data) {
    if (name === 'item_selected') {
      instance.publishState('selected_item', data.item);
      instance.triggerEvent('item_selected');
    }
  }
}
```

## Mise à jour des props depuis update.js

```js
function(instance, properties, context) {
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;
  try {
    if (!instance.data.initialized || !instance.data.root) { return; }

    window.MonPlugin.update(instance.data.root, {
      items: readList(properties.data_source),
      color: properties.color || '#3B82F6'
    });

  } finally {
    instance.data.isUpdating = false;
  }
}
```

---

## Workflow de développement recommandé

```
mon-bundle/                 ← projet esbuild local
  src/
    index.jsx               ← point d'entrée, expose window.MonPlugin
    App.jsx                 ← composant React principal
    components/
  build.js                  ← script de build esbuild
  package.json

planning_hebdo/             ← projet Bubble plugin
  initialize2.js            ← charge le bundle via URL
  update2.js
```

**Cycle de travail :**
1. Développer dans `src/` (tester dans un HTML standalone ou Storybook si besoin)
2. `node build.js` → `dist/bundle.iife.js`
3. Uploader le bundle (Bubble storage ou CDN)
4. Mettre à jour l'URL dans le plugin Bubble si nécessaire
5. Tester dans Bubble

---

## Vite — quand l'utiliser ?

Vite est un environnement de développement complet (serveur dev + hot reload + esbuild en interne). Il est utile **uniquement** si tu veux développer ton composant React dans un navigateur avec hot reload avant de l'intégrer dans Bubble.

Pour la plupart des cas d'usage Bubble, **esbuild seul suffit** : le workflow est plus simple et le résultat identique.

Si tu veux quand même utiliser Vite, configure `vite.config.js` avec `build.lib.formats: ['iife']` — le résultat final sera le même fichier IIFE à héberger.

---

## Résumé

| | CDN | Bundle esbuild |
|---|---|---|
| Setup | Aucun | `npm install esbuild` + `build.js` |
| Taille | Dépend du CDN | Contrôlé, minifié |
| React | Non | Oui |
| Toutes dépendances npm | Non | Oui |
| Recommandé pour | Chart.js, Sortable | React, librairies complexes |
