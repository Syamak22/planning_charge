# Bubble Plugin — API Reference complète

## Objets Bubble (client-side)

### List object (`data_type` property)
```js
dataSource.length()              // → Number (synchrone côté client)
dataSource.get(start, length)    // → Array d'objets Bubble
```

### Bubble object
```js
obj.get('_id')                   // → String (ID unique)
obj.get('fieldName')             // → valeur du champ (String, Number, Date, objet Bubble, list...)
obj.listProperties()             // → Array<String> des noms de champs accessibles
typeof obj.get === 'function'    // → true si c'est bien un objet Bubble
```

### Relation field (champ pointant vers un autre type)
```js
var ref = obj.get('champ_relation');
// Si single : ref est un objet Bubble → ref.get('_id')
// Si liste  : ref est un list object → ref.length(), ref.get(0, n)
```

---

## `instance` (initialize.js + update.js)

```js
instance.canvas              // div jQuery wrappant l'élément dans Bubble
instance.publishState(name, value)   // publie un état vers Bubble
instance.triggerEvent(name)          // déclenche un event Bubble
instance.data                        // objet persistant entre initialize et update
                                     // (lire/écrire : instance.data.maVariable)
```

---

## `properties` (update.js)

```js
properties.monNom         // valeur de la property définie dans le plugin editor
properties.bubble         // propriétés visuelles de l'élément Bubble (voir ci-dessous)
```

Types de propriétés :
- `String` → valeur texte directe
- `Number` → valeur numérique directe
- `Date` → objet Date JavaScript
- `Boolean` → true/false
- `data_type` → list object Bubble (voir ci-dessus)

---

## `context` (initialize.js + update.js)

```js
context.currentUser.get('email')     // utilisateur connecté
context.currentUser.get('_id')
context.currentUser.listProperties()

context.jQuery                        // objet jQuery global

context.uploadContent(fileName, base64String, callback, [attachTo])
// callback: function(err, url)
// base64String: données sans le préfixe "data:...;base64,"

context.async(fn)                     // fn prend un callback(err, res), retourne res ou throw
context.keys                          // objet avec les clés définies dans l'onglet Plugin
context.onCookieOptIn(callback)       // exécuté quand les cookies sont acceptés
context.reportDebugger(message)       // envoie un message au debugger Bubble
```

---

## `properties.bubble` — Liste complète

```js
properties.bubble.width()
properties.bubble.height()
properties.bubble.is_visible()
properties.bubble.padding_vertical()
properties.bubble.padding_horizontal()

// Background
properties.bubble.background_style()            // 'flat', 'gradient', etc.
properties.bubble.bgcolor()
properties.bubble.background_gradient_style()
properties.bubble.background_gradient_direction()
properties.bubble.background_gradient_custom_angle()
properties.bubble.background_radial_gradient_shape()
properties.bubble.background_radial_gradient_size()
properties.bubble.background_radial_gradient_xpos()
properties.bubble.background_radial_gradient_ypos()
properties.bubble.background_gradient_from()
properties.bubble.background_gradient_to()
properties.bubble.background_gradient_mid()
properties.bubble.background_image()
properties.bubble.center_background()
properties.bubble.background_size_cover()
properties.bubble.crop_responsive()
properties.bubble.repeat_background_vertical()
properties.bubble.repeat_background_horizontal()
properties.bubble.background_color_if_empty_image()

// Borders (uniformes)
properties.bubble.four_border_style()  // true = 4 bordures distinctes
properties.bubble.border_style()
properties.bubble.border_roundness()
properties.bubble.border_width()
properties.bubble.border_color()

// Borders (par côté)
properties.bubble.border_style_top()    // idem pour _right, _bottom, _left
properties.bubble.border_roundness_top()
properties.bubble.border_width_top()
properties.bubble.border_color_top()
```
