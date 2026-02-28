# Bubble Plugin — Code Samples

## `initialize.js` — Dropdown multi-select

```js
function(instance, context) {
  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'dropdown-' + instanceId;

  var style = document.createElement('style');
  style.innerHTML = `
    .dropdown-${instanceId} { position: relative; width: 100%; height: 100%; }
    .dropdown-${instanceId} .header {
      border: 1px solid #ccc; border-radius: 8px; padding: 8px 12px;
      background: #fff; cursor: pointer; display: flex;
      justify-content: space-between; align-items: center; height: 100%;
    }
    .dropdown-${instanceId} .options {
      position: fixed; background: #fff; border: 1px solid #ccc;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: none; z-index: 9999; max-height: 300px; overflow-y: auto;
    }
    .dropdown-${instanceId} .option { padding: 8px 12px; cursor: pointer; }
    .dropdown-${instanceId} .option:hover { background: #f5f5f5; }
  `;
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.className = 'dropdown-' + instanceId;
  container.setAttribute('data-id', instanceId);

  var header = document.createElement('div');
  header.className = 'header';
  var headerText = document.createElement('span');
  headerText.textContent = 'Sélectionner...';
  header.appendChild(headerText);

  var options = document.createElement('div');
  options.className = 'options';
  options.setAttribute('data-id', instanceId);

  container.appendChild(header);
  document.body.appendChild(options);  // attaché au body pour dépasser les conteneurs

  function positionOptions() {
    var rect = header.getBoundingClientRect();
    options.style.width = rect.width + 'px';
    options.style.top = (rect.bottom + 4) + 'px';
    options.style.left = rect.left + 'px';
  }

  header.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = options.style.display === 'block';
    if (!isOpen) {
      positionOptions();
      options.style.display = 'block';
    } else {
      options.style.display = 'none';
    }
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('[data-id="' + instanceId + '"]')) {
      options.style.display = 'none';
    }
  });

  instance.data.container = container;
  instance.data.headerText = headerText;
  instance.data.optionsEl = options;
  instance.data.selectedIds = [];
  instance.canvas.append(container);
  instance.data.initialized = true;
}
```

---

## `update.js` — Dropdown avec hash + recursion protection

```js
function(instance, properties, context) {
  var dataSource = properties.data_source;
  var displayField = properties.display_field;

  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {
    if (!instance.data.initialized) { return; }

    // Hash check
    var hash = '';
    if (dataSource && typeof dataSource.length === 'function') {
      var len = dataSource.length();
      hash = 'len:' + len;
      if (len > 0) {
        var items = dataSource.get(0, Math.min(len, 5));
        for (var i = 0; i < items.length; i++) {
          if (items[i] && typeof items[i].get === 'function') {
            hash += '|' + (items[i].get('_id') || '');
          }
        }
      }
    }
    if (instance.data.lastHash === hash) { return; }
    instance.data.lastHash = hash;

    // Rebuild options
    var optionsEl = instance.data.optionsEl;
    optionsEl.innerHTML = '';

    if (!dataSource || typeof dataSource.length !== 'function') { return; }
    var len = dataSource.length();
    if (len === 0) { return; }
    var items = dataSource.get(0, len);

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || typeof item.get !== 'function') { continue; }
      var id = item.get('_id');
      var name = item.get(displayField) || '—';

      (function(itemId, itemName, bubbleObj) {
        var div = document.createElement('div');
        div.className = 'option';
        div.textContent = itemName;
        div.addEventListener('click', function(e) {
          e.stopPropagation();
          instance.data.selectedIds = [itemId];
          instance.data.headerText.textContent = itemName;
          optionsEl.style.display = 'none';
          instance.publishState('selected_item', bubbleObj);
          instance.triggerEvent('item_selected');
        });
        optionsEl.appendChild(div);
      })(id, name, item);
    }

  } finally {
    instance.data.isUpdating = false;
  }
}
```

---

## `preview.js` — Étoiles (preview éditeur Bubble)

```js
function(instance, properties) {
  var starCount = properties.star_count || 5;
  var starColor = properties.star_color || '#FFD700';
  var starSize = properties.star_size || 24;
  var value = properties.initial_value || 0;

  var html = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;gap:4px;">';
  for (var i = 0; i < starCount; i++) {
    var filled = i < Math.floor(value) ? starColor : 'none';
    html += '<svg width="' + starSize + '" height="' + starSize + '" viewBox="0 0 24 24" fill="' + filled + '" stroke="' + starColor + '" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }
  html += '</div>';

  $(instance.canvas).empty().append(html);
}
```

## `preview.js` — Version simple (icône)

```js
function(instance, properties) {
  $(instance.canvas).empty().append(
    '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">' +
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
    '</div>'
  );
}
```

---

## `style.css`

```html
<style>
  :root {
    --plugin-bg: #ffffff;
    --plugin-border: #e2e8f0;
    --plugin-radius: 8px;
    --plugin-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  /* Toutes les règles CSS du plugin sont déclarées ici */
  /* Les règles scopées au plugin utilisent une classe unique générée dans initialize.js */
</style>
```

---

## Client-side action

```js
function(properties, context) {
  var message = properties.message || 'Pas de message';
  alert(message);
  // Pas de return nécessaire pour les actions sans valeur de retour
}
```

---

## Server-side action (simple)

```js
async function(properties, context) {
  var inputValue = properties.input_value || '';
  var result = inputValue.toString().toUpperCase();
  return { "result": result };
}
```
