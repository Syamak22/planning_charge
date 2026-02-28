# Bubble Plugin — Server-Side Actions

## Règle fondamentale : tout est async

Dans les server-side actions, `.length()` et `.get()` retournent des **Promises**, pas des valeurs directes. Il faut `await` sur chaque appel.

```js
// ❌ FAUX
var len = dataSource.length();   // len = Promise, pas un Number !

// ✓ CORRECT
var len = await dataSource.length();   // len = 3
```

---

## Pattern de base — lire une liste

```js
async function(properties, context) {
  var dataSource = properties.data_source;
  var fieldName  = properties.field_name;

  if (!dataSource) { return { "result": null }; }

  try {
    var len = await dataSource.length();
    if (len === 0) { return { "result": null }; }

    var items = await dataSource.get(0, len);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item) { continue; }
      var value = await item.get(fieldName);
      console.log(value);
    }
  } catch (err) {
    console.error('Erreur lecture données:', err);
  }

  return { "result": "ok" };
}
```

**Les 3 opérations qui nécessitent `await` :**
1. `await dataSource.length()`
2. `await dataSource.get(start, count)`
3. `await item.get('fieldName')`

---

## Normalisation des dates (+12 heures)

**Problème :** Bubble stocke les dates en UTC. Un utilisateur à Paris (UTC+1) qui sélectionne le 7 nov à 00:00 envoie en réalité le 6 nov 23:00 UTC → mauvais jour extrait.

**Solution :** ajouter 12h avant d'extraire le jour, puis utiliser les méthodes UTC.

```js
function normalizeDate(dateValue) {
  var d = new Date(dateValue);
  return new Date(d.getTime() + 12 * 60 * 60 * 1000);  // +12h
}

function toDateString(dateValue) {
  var d = normalizeDate(dateValue);
  var y = d.getUTCFullYear();
  var m = String(d.getUTCMonth() + 1).padStart(2, '0');
  var day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;  // "2025-11-07"
}

// Toujours utiliser getUTCFullYear / getUTCMonth / getUTCDate / getUTCDay
// Ne jamais utiliser getFullYear / getMonth / getDate / getDay après normalisation
```

---

## Exemple complet — Calculateur de jours ouvrés

```js
async function(properties, context) {
  var startDate    = properties.start_date;
  var numberOfDays = properties.number_of_days;
  var dataSource   = properties.data_source;   // liste de jours fériés/off
  var dateField    = properties.date_field;    // nom du champ date sur chaque objet

  if (numberOfDays <= 0) { return { "end_date": startDate }; }

  // Charger les jours off dans un Set pour lookups O(1)
  var offDaysSet = new Set();
  if (dataSource) {
    try {
      var len = await dataSource.length();
      if (len > 0) {
        var offItems = await dataSource.get(0, len);
        for (var i = 0; i < offItems.length; i++) {
          var offDate = await offItems[i].get(dateField);
          if (offDate) { offDaysSet.add(toDateString(offDate)); }
        }
      }
    } catch (e) { /* continuer sans jours off */ }
  }

  function isWeekend(d) { var day = d.getUTCDay(); return day === 0 || day === 6; }
  function isOffDay(d)  { return offDaysSet.has(toDateString(d)); }
  function isBizDay(d)  { return !isWeekend(d) && !isOffDay(d); }
  function normalizeDate(v) { return new Date(new Date(v).getTime() + 12*60*60*1000); }
  function toDateString(v) {
    var d = normalizeDate(v);
    return d.getUTCFullYear() + '-' +
           String(d.getUTCMonth()+1).padStart(2,'0') + '-' +
           String(d.getUTCDate()).padStart(2,'0');
  }

  var current = normalizeDate(startDate);
  var remaining = numberOfDays - 1;  // startDate compte comme jour 1

  while (remaining > 0) {
    current.setDate(current.getDate() + 1);
    if (isBizDay(current)) { remaining--; }
  }

  return { "end_date": current };
}
```
