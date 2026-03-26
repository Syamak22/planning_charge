function(instance, context) {

  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'pc-' + instanceId;
  var id = instance.data.instanceName;
  var s  = '.' + id + ' ';

  /* ── CSS ─────────────────────────────────────────────────────────── */
  var svgSearch  = '<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var svgFilter  = '<svg width="12" height="12" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';
  var svgChevron = '<svg class="sdd-chv" width="10" height="10" fill="none" stroke="#6b7280" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';

  var css = [
    /* racine */
    '.' + id + '{display:flex;flex-direction:column;width:100%;height:100%;font-family:inherit;font-size:13px;color:#1f2937;background:#fff;overflow:hidden;}',
    s + '*{box-sizing:border-box;}',

    /* barre du haut */
    s + '.tb{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid #e5e7eb;flex-shrink:0;background:#fff;}',
    s + '.srch{display:flex;align-items:center;gap:7px;background:#f3f4f6;border-radius:8px;padding:5px 11px;flex:1;max-width:280px;}',
    s + '.srch input{border:none;background:none;outline:none;font-size:12px;color:#374151;width:100%;}',
    s + '.tot{font-size:12px;color:#6b7280;margin-left:auto;}',
    s + '.stf{display:flex;align-items:center;gap:6px;}',
    /* dropdown custom statut */
    s + '.sdd{position:relative;}',
    s + '.sdd-btn{display:flex;align-items:center;gap:6px;background:#f3f4f6;border-radius:8px;padding:5px 11px;cursor:pointer;font-size:12px;color:#374151;user-select:none;white-space:nowrap;font-family:inherit;}',
    s + '.sdd-btn:hover{background:#e9eaec;}',
    s + '.sdd-btn.active{background:#fdf2f8;color:#e91e8c;border:1px solid #f9a8d4;}',
    s + '.sdd-chv{flex-shrink:0;transition:transform .15s;}',
    s + '.sdd-btn.open .sdd-chv{transform:rotate(180deg);}',
    s + '.sdd-panel{display:none;position:absolute;top:calc(100% + 5px);right:0;min-width:170px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.1);z-index:200;overflow:hidden;}',
    s + '.sdd-panel.open{display:block;}',
    s + '.sdd-item{padding:8px 14px;font-size:12px;color:#374151;cursor:pointer;font-family:inherit;}',
    s + '.sdd-item:hover{background:#f9fafb;}',
    s + '.sdd-item.active{background:#fdf2f8;color:#e91e8c;font-weight:600;}',
    s + '.aj{font-size:11px;font-weight:600;color:#6b7280;background:none;border:1px solid #d1d5db;border-radius:6px;padding:3px 8px;cursor:pointer;line-height:1.4;white-space:nowrap;font-family:inherit;}',
    s + '.aj:hover{background:#f3f4f6;color:#374151;border-color:#9ca3af;}',

    /* corps */
    s + '.bd{display:flex;flex:1;overflow:hidden;position:relative;}',

    /* panneau gauche (largeur via CSS var) */
    s + '.lp{width:var(--pc-lw,296px);flex-shrink:0;display:flex;flex-direction:column;border-right:2px solid #e5e7eb;background:#fff;z-index:3;}',
    s + '.lh{flex-shrink:0;border-bottom:2px solid #e5e7eb;position:relative;}',
    s + '.ch-st-lbl{position:absolute;top:6px;left:10px;font-size:10px;font-weight:600;color:#6b7280;pointer-events:none;}',
    s + '.pl{overflow-y:hidden;flex:1;}',           /* scroll piloté par .rp */
    s + '.pr{display:flex;align-items:center;height:30px;padding:0 12px 0 10px;border-bottom:1px solid #f3f4f6;font-size:11.5px;color:#374151;cursor:pointer;}',
    s + '.pr:hover{background:#f9fafb;}',
    s + '.pr.sel{background:#fdf2f8;box-shadow:inset 3px 0 0 #e91e8c;}',
    s + '.gr.sel{background:#fdf2f8;}',
    s + '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',

    /* panneau droit */
    s + '.rp{flex:1;overflow:auto;min-width:0;background:#fff;}',
    s + '.rp::-webkit-scrollbar{height:4px;}',
    s + '.rp::-webkit-scrollbar-track{background:#f1f1f1;}',
    s + '.rp::-webkit-scrollbar-thumb{background:#e91e8c;border-radius:2px;}',

    /* en-tête calendrier (sticky) */
    s + '.ch{position:sticky;top:0;background:#fff;z-index:10;width:max-content;min-width:100%;border-bottom:2px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.07);}',
    s + '.mr{display:flex;padding:4px 0 0;}',
    s + '.ms{display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:11px;font-weight:700;color:#111827;padding:0 4px;}',
    s + '.ms+.ms{border-left:2px solid #6b7280;}',

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

    /* graphique de charge (dans le header scrollable) */
    s + '.chg{position:relative;flex-shrink:0;background:#fafafa;border-bottom:1px solid #eeeff1;}',

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
      '<div class="stf">' + svgFilter +
        '<div class="sdd">' +
          '<div class="sdd-btn"><span class="sdd-lbl">Tous les statuts</span>' + svgChevron + '</div>' +
          '<div class="sdd-panel"></div>' +
        '</div>' +
      '</div>' +
      '<button class="aj">Aujourd\'hui</button>' +
      '<span class="tot">Total : —</span>' +
    '</div>' +
    '<div class="bd">' +
      '<div class="lp"><div class="lh"><div class="ch-st-lbl">Graphique = tous chantiers</div></div><div class="pl"></div></div>' +
      '<div class="rp"><div class="ch"></div><div class="cg"></div></div>' +
      '<div class="ld"><div class="ls" style="animation:pcSpin_' + instanceId + ' .7s linear infinite"></div></div>' +
    '</div>';

  $(instance.canvas).append(root);

  /* ── Refs ─────────────────────────────────────────────────────────── */
  instance.data.root     = root;
  instance.data.srchInp  = root.querySelector('.srch input');
  instance.data.totSpan  = root.querySelector('.tot');
  instance.data.sddBtn        = root.querySelector('.sdd-btn');
  instance.data.sddPanel      = root.querySelector('.sdd-panel');
  instance.data.chartStatutLbl = root.querySelector('.ch-st-lbl');
  instance.data.currentStatutVal = null;
  instance.data.leftHdr  = root.querySelector('.lh');
  instance.data.projList = root.querySelector('.pl');
  instance.data.calHdr   = root.querySelector('.ch');
  instance.data.calGrid  = root.querySelector('.cg');
  instance.data.leftPnl  = root.querySelector('.lp');
  instance.data.rightPnl = root.querySelector('.rp');
  instance.data.loaderEl = root.querySelector('.ld');
  instance.data.todayBtn = root.querySelector('.aj');

  /* ── Bouton Aujourd'hui ──────────────────────────────────────────── */
  instance.data.todayBtn.addEventListener('click', function() {
    instance.data.rightPnl.scrollLeft = instance.data.todayScrollX || 0;
  });

  /* ── Sélection chantier ──────────────────────────────────────────── */
  instance.data.projList.addEventListener('click', function(e) {
    var row = e.target.closest ? e.target.closest('.pr') : null;
    if (!row) return;
    var idx = parseInt(row.getAttribute('data-idx'), 10);
    var list = instance.data.chantiersList;
    if (!list || isNaN(idx) || idx < 0 || idx >= list.length) return;

    // Highlight ligne gauche + ligne grille
    instance.data.projList.querySelectorAll('.pr').forEach(function(r) { r.classList.remove('sel'); });
    instance.data.calGrid.querySelectorAll('.gr').forEach(function(r) { r.classList.remove('sel'); });
    row.classList.add('sel');
    var gRows = instance.data.calGrid.querySelectorAll('.gr');
    if (gRows[idx]) gRows[idx].classList.add('sel');

    instance.data.selectedIdx = idx;

    instance.data.isUpdating = true;
    instance.publishState('selected_chantier', list[idx].raw);
    instance.triggerEvent('chantier_selectionne');
    instance.data.isUpdating = false;
  });

  /* ── Synchronisation scroll vertical gauche ↔ droite ─────────────── */
  instance.data.rightPnl.addEventListener('scroll', function() {
    instance.data.projList.scrollTop = this.scrollTop;
  });

  /* ── Filtre recherche textuelle ──────────────────────────────────── */
  instance.data.applyFilters = function() {
    var q     = instance.data.srchInp.value.toLowerCase();
    var pRows = instance.data.projList.querySelectorAll('.pr');
    var gRows = instance.data.calGrid.querySelectorAll('.gr');
    var vis   = 0;
    pRows.forEach(function(row, i) {
      var name = (row.getAttribute('data-name') || '').toLowerCase();
      var show = !q || name.indexOf(q) >= 0;
      row.style.display = show ? '' : 'none';
      if (gRows[i]) gRows[i].style.display = show ? '' : 'none';
      if (show) vis++;
    });
    instance.data.totSpan.textContent = 'Total : ' + vis;
  };

  /* ── Dropdown statut custom ──────────────────────────────────────── */
  instance.data.setStatut = function(lbl) {
    instance.data.currentStatutVal = lbl;
    instance.data.sddBtn.querySelector('.sdd-lbl').textContent = lbl || 'Tous les statuts';
    instance.data.sddBtn.classList.toggle('active', !!lbl);
    var csl = instance.data.chartStatutLbl;
    if (csl) { csl.textContent = 'Graphique = ' + (lbl || 'tous chantiers'); }
    instance.data.sddPanel.querySelectorAll('.sdd-item').forEach(function(el) {
      el.classList.toggle('active', el.getAttribute('data-val') === (lbl || ''));
    });
  };

  instance.data.sddBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = instance.data.sddPanel.classList.toggle('open');
    instance.data.sddBtn.classList.toggle('open', open);
  });

  instance.data.sddPanel.addEventListener('click', function(e) {
    var item = e.target.closest ? e.target.closest('.sdd-item') : null;
    if (!item) return;
    var val = item.getAttribute('data-val') || '';
    var obj = val ? (instance.data.statutsMap && instance.data.statutsMap[val]) || null : null;
    instance.data.setStatut(val);
    instance.data.sddPanel.classList.remove('open');
    instance.data.sddBtn.classList.remove('open');
    instance.data.isUpdating = true;
    instance.publishState('statut_selectionne', obj);
    instance.triggerEvent('statut_change');
    instance.data.isUpdating = false;
  });

  instance.data.closeDropdown = function() {
    instance.data.sddPanel.classList.remove('open');
    instance.data.sddBtn.classList.remove('open');
  };
  document.addEventListener('click', instance.data.closeDropdown);

  /* ── Recherche textuelle ──────────────────────────────────────────── */
  instance.data.srchInp.addEventListener('input', function() {
    instance.data.applyFilters();
  });

  instance.data.initialized = true;
}