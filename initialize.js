function(instance, context) {

  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'pc-' + instanceId;
  var id = instance.data.instanceName;
  var s  = '.' + id + ' ';

  /* ── CSS ─────────────────────────────────────────────────────────── */
  var svgSearch = '<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var svgFilter = '<svg width="12" height="12" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';

  var css = [
    /* racine */
    '.' + id + '{display:flex;flex-direction:column;width:100%;height:100%;font-family:inherit;font-size:13px;color:#1f2937;background:#fff;overflow:hidden;}',
    s + '*{box-sizing:border-box;}',

    /* barre du haut */
    s + '.tb{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid #e5e7eb;flex-shrink:0;background:#fff;}',
    s + '.srch{display:flex;align-items:center;gap:7px;background:#f3f4f6;border-radius:8px;padding:5px 11px;flex:1;max-width:280px;}',
    s + '.srch input{border:none;background:none;outline:none;font-size:12px;color:#374151;width:100%;}',
    s + '.tot{font-size:12px;color:#6b7280;}',
    s + '.stf{display:flex;align-items:center;gap:6px;background:#f3f4f6;border-radius:8px;padding:5px 11px;margin-left:auto;}',
    s + '.stf select{border:none;background:none;outline:none;font-size:12px;color:#374151;font-family:inherit;cursor:pointer;}',

    /* corps */
    s + '.bd{display:flex;flex:1;overflow:hidden;position:relative;}',

    /* panneau gauche (largeur via CSS var) */
    s + '.lp{width:var(--pc-lw,296px);flex-shrink:0;display:flex;flex-direction:column;border-right:2px solid #e5e7eb;background:#fff;z-index:3;}',
    s + '.lh{flex-shrink:0;border-bottom:2px solid #e5e7eb;}',
    s + '.pl{overflow-y:hidden;flex:1;}',           /* scroll piloté par .rp */
    s + '.pr{display:flex;align-items:center;height:30px;padding:0 12px 0 10px;border-bottom:1px solid #f3f4f6;font-size:11.5px;color:#374151;cursor:pointer;}',
    s + '.pr:hover{background:#f9fafb;}',
    s + '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',

    /* panneau droit */
    s + '.rp{flex:1;overflow:auto;min-width:0;background:#fff;}',
    s + '.rp::-webkit-scrollbar{height:4px;}',
    s + '.rp::-webkit-scrollbar-track{background:#f1f1f1;}',
    s + '.rp::-webkit-scrollbar-thumb{background:#e91e8c;border-radius:2px;}',

    /* en-tête calendrier (sticky) */
    s + '.ch{position:sticky;top:0;background:#fff;z-index:10;width:max-content;min-width:100%;border-bottom:2px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.07);}',
    s + '.mr{display:flex;padding:4px 0 0;}',
    s + '.ms{display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.07em;padding:0 4px;}',
    s + '.ms+.ms{border-left:1px solid #e5e7eb;}',

    /* groupes de semaines */
    s + '.wr{display:flex;}',
    s + '.wg{display:flex;gap:3px;flex-shrink:0;}',
    s + '.ws{flex-shrink:0;border-left:1px solid #e9eaec;}',

    /* colonnes de jours */
    s + '.dc{flex-shrink:0;text-align:center;}',
    s + '.dc.we{background:#f5f6f8;border-radius:3px;}',          /* week-end */
    s + '.dc.jo{background:#fff3f3;border-radius:3px;}',          /* jour off */
    s + '.dn{font-size:9.5px;color:#9ca3af;line-height:1.4;}',
    s + '.dc.we .dn,.dc.jo .dn{font-size:8.5px;color:#c0c2c9;}',
    s + '.dd{font-size:11.5px;font-weight:600;color:#374151;line-height:1.6;}',
    s + '.dc.we .dd{font-size:10px;font-weight:500;color:#c0c2c9;}',
    s + '.dc.jo .dd{font-size:10px;font-weight:500;color:#e08080;}',
    s + '.dd.today{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;background:#e91e8c;color:#fff;border-radius:4px;line-height:1;}',

    /* rangée des compteurs */
    s + '.cr{display:flex;background:#fafafa;padding:3px 0 2px;border-top:1px solid #eeeff1;}',
    s + '.cc{flex-shrink:0;text-align:center;font-size:9px;font-weight:700;line-height:1;}',

    /* rangées de la grille */
    s + '.gr{display:flex;align-items:center;height:30px;border-bottom:1px solid #f3f4f6;padding:4px 0;}',
    s + '.tl{flex-shrink:0;height:22px;border-radius:5px;}',
    s + '.tl.we{border-radius:5px;}',

    /* loader */
    s + '.ld{position:absolute;inset:0;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;z-index:20;}',
    s + '.ls{width:32px;height:32px;border:3px solid #e9eaec;border-top-color:#e91e8c;border-radius:50%;}',
    '@keyframes pcSpin_' + instanceId + '{to{transform:rotate(360deg)}}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
  instance.data.styleEl = styleEl;

  /* ── DOM ─────────────────────────────────────────────────────────── */
  var root = document.createElement('div');
  root.className = id;
  root.style.height = '100%';
  root.innerHTML =
    '<div class="tb">' +
      '<div class="srch">' + svgSearch + '<input type="text" placeholder="nom chantier, nom client…"></div>' +
      '<span class="tot">Total : —</span>' +
      '<div class="stf">' + svgFilter + '<select><option value="">Tous les statuts</option></select></div>' +
    '</div>' +
    '<div class="bd">' +
      '<div class="lp"><div class="lh"></div><div class="pl"></div></div>' +
      '<div class="rp"><div class="ch"></div><div class="cg"></div></div>' +
      '<div class="ld"><div class="ls" style="animation:pcSpin_' + instanceId + ' .7s linear infinite"></div></div>' +
    '</div>';

  $(instance.canvas).append(root);

  /* ── Refs ─────────────────────────────────────────────────────────── */
  instance.data.root     = root;
  instance.data.srchInp  = root.querySelector('.srch input');
  instance.data.totSpan  = root.querySelector('.tot');
  instance.data.stfSel   = root.querySelector('.stf select');
  instance.data.leftHdr  = root.querySelector('.lh');
  instance.data.projList = root.querySelector('.pl');
  instance.data.calHdr   = root.querySelector('.ch');
  instance.data.calGrid  = root.querySelector('.cg');
  instance.data.leftPnl  = root.querySelector('.lp');
  instance.data.rightPnl = root.querySelector('.rp');
  instance.data.loaderEl = root.querySelector('.ld');

  /* ── Synchronisation scroll vertical gauche ↔ droite ─────────────── */
  instance.data.rightPnl.addEventListener('scroll', function() {
    instance.data.projList.scrollTop = this.scrollTop;
  });

  /* ── Filtre statut → publishState ────────────────────────────────── */
  instance.data.stfSel.addEventListener('change', function() {
    instance.data.isUpdating = true;
    instance.publishState('statut_selectionne', this.value);
    instance.data.isUpdating = false;
  });

  /* ── Recherche textuelle ──────────────────────────────────────────── */
  instance.data.srchInp.addEventListener('input', function() {
    var q     = this.value.toLowerCase();
    var pRows = instance.data.projList.querySelectorAll('.pr');
    var gRows = instance.data.calGrid.querySelectorAll('.gr');
    var vis   = 0;
    pRows.forEach(function(row, i) {
      var name = (row.getAttribute('data-name') || '').toLowerCase();
      var show = !q || name.indexOf(q) >= 0;
      row.style.display        = show ? '' : 'none';
      if (gRows[i]) gRows[i].style.display = show ? '' : 'none';
      if (show) vis++;
    });
    instance.data.totSpan.textContent = 'Total : ' + vis;
  });

  instance.data.initialized = true;
}
