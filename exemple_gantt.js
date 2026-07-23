  function(instance, context) {

  // ════════════════════════════════════════════════════════════════════════════
  //  CONFIGURATION — toutes les constantes modifiables ici
  // ════════════════════════════════════════════════════════════════════════════

  // ── Layout (dimensions en px) ────────────────────────────────────────────────
  var LEFT_W    = 200;  // largeur du panneau gauche (noms des équipes)
  var ROW_H     = 56;   // hauteur d'une ligne employé
  var HDR_H     = 30;   // hauteur d'un en-tête de section (Collaborateurs / SST)
  var DAY_H     = 40;   // hauteur de la ligne des numéros de jours (droite)
  var SEARCH_H  = 42;   // hauteur de la barre de recherche (gauche) — doit être compensée à droite
  var TOPBAR_H  = 52;   // hauteur de la barre de navigation

  // ── ITEMs (barres de chantier / planning) ────────────────────────────────────
  var ITEM_MARGIN = 5;  // marge verticale haut/bas entre le bord de ligne et la barre
  var ITEM_GAP    = 3;  // espace en px entre deux barres empilées (overlap)
  var ITEM_RADIUS = 5;  // border-radius des barres en px
  var ITEM_FONT   = 10; // taille de police du label dans la barre (px)

  // ── Couleurs principales ─────────────────────────────────────────────────────
  var PRIMARY          = '#f20d0d'; // couleur de marque — boutons, labels de section
  var PRIMARY_LIGHT    = '#fd6c70'; // hover sur bouton CTA
  var PRIMARY_CONTRAST = '#fef2f2'; // fond très clair (hover secondaire, today)
  var BG_GLOBAL        = '#F1F5F9'; // fond général du plugin
  var BG_SURFACE       = '#ffffff'; // fond des panneaux / cartes
  var BG_HEADER        = '#F8FAFC'; // fond des en-têtes de section
  var COLOR_BORDER     = '#e2e8f0'; // bordure standard
  var COLOR_BORDER_STR = '#CBD5E1'; // bordure forte (séparateur panneau gauche)
  var COLOR_TEXT       = '#1e293b'; // texte principal
  var COLOR_TEXT_2     = '#64748B'; // texte secondaire (numéros de jours...)

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  var TOOLTIP_BG  = '#1e293b'; // fond du tooltip
  var TOOLTIP_TXT = '#ffffff'; // texte du tooltip

  // ── Couleurs des avatars employés (cycle automatique) ────────────────────────
  var EMP_COLORS = [
    '#3B82F6', '#F97316', '#7C3AED', '#059669',
    '#DB2777', '#0EA5E9', '#EF4444', '#F59E0B',
  ];

  // ── Palette des chantiers (cycle automatique, 8 couleurs) ────────────────────
  var CH_PALETTE = [
    { bg:'#EFF6FF', bdr:'#3B82F6', txt:'#1D4ED8' }, // bleu
    { bg:'#FFF7ED', bdr:'#F97316', txt:'#C2410C' }, // orange
    { bg:'#F5F3FF', bdr:'#7C3AED', txt:'#5B21B6' }, // violet
    { bg:'#ECFDF5', bdr:'#059669', txt:'#065F46' }, // vert
    { bg:'#FDF2F8', bdr:'#DB2777', txt:'#9D174D' }, // rose
    { bg:'#FFFBEB', bdr:'#F59E0B', txt:'#92400E' }, // ambre
    { bg:'#FEF2F2', bdr:'#EF4444', txt:'#991B1B' }, // rouge clair
    { bg:'#F0F9FF', bdr:'#0EA5E9', txt:'#0369A1' }, // cyan
  ];

  // ── Localisation ─────────────────────────────────────────────────────────────
  var MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var DAYS_FR   = ['Di','Lu','Ma','Me','Je','Ve','Sa'];

  // ── Titre affiché dans la topbar ─────────────────────────────────────────────
  var PLUGIN_TITLE = 'Charge collaborateurs';

  // ════════════════════════════════════════════════════════════════════════════
  //  FIN CONFIGURATION
  // ════════════════════════════════════════════════════════════════════════════

    var uid = 'charge' + Math.random().toString(36).substr(2, 8);
    instance.data.uid = uid;

    // ─── PALETTE CHANTIERS ────────────────────────────────────────────────────────
    instance.data.CH_PALETTE    = CH_PALETTE;
    instance.data.CH            = {};
    instance.data.chPaletteIdx  = 0;

    instance.data.getChColors = function(name) {
      if (!instance.data.CH[name]) {
        instance.data.CH[name] = instance.data.CH_PALETTE[instance.data.chPaletteIdx % instance.data.CH_PALETTE.length];
        instance.data.chPaletteIdx++;
      }
      return instance.data.CH[name];
    };

    // ─── NAVIGATION ───────────────────────────────────────────────────────────────
    var now = new Date();
    instance.data.year  = now.getFullYear();
    instance.data.month = now.getMonth();

    // ─── DONNÉES (vides — remplies par update.js) ─────────────────────────────────
    instance.data.employees      = [];
    instance.data.subcontractors = [];
    instance.data.joursOff       = [];
    instance.data.assignments    = [];

    // false = skeleton affiché, true = vraies données Bubble
    instance.data.usingRealData = false;

    // ─── ÉTATS TOGGLE + RECHERCHE ─────────────────────────────────────────────────
    instance.data.leftVisible   = true;
    instance.data.showCollabs   = true;
    instance.data.showSubs      = true;
    instance.data.showWeekends  = false;
    instance.data.searchQuery   = '';

    // ─── ROWS (liste plate tenant compte des toggles + filtre recherche) ──────────
    instance.data.buildRows = function() {
      var q = (instance.data.searchQuery || '').toLowerCase().trim();

      function matches(name) {
        return !q || name.toLowerCase().indexOf(q) !== -1;
      }

      var filteredEmps = instance.data.employees.filter(function(e) { return matches(e.name); });
      var filteredSubs = instance.data.subcontractors.filter(function(e) { return matches(e.name); });

      var rows = [];
      rows.push({ type:'header', label:'Collaborateurs', section:'collabs', count: filteredEmps.length, total: instance.data.employees.length });
      if (instance.data.showCollabs) {
        filteredEmps.forEach(function(e, i) {
          rows.push({ type:'emp', emp:e, colorIdx:instance.data.employees.indexOf(e) });
        });
      }
      rows.push({ type:'header', label:'Sous-traitants', section:'subs', count: filteredSubs.length, total: instance.data.subcontractors.length });
      if (instance.data.showSubs) {
        filteredSubs.forEach(function(e, i) {
          rows.push({ type:'emp', emp:e, colorIdx:instance.data.subcontractors.indexOf(e) + instance.data.employees.length });
        });
      }
      return rows;
    };

    instance.data.rowTop = function(rows, idx) {
      var top = 0;
      for (var i = 0; i < idx; i++) top += rows[i].type === 'header' ? HDR_H : ROW_H;
      return top;
    };

    // ─── DOM ──────────────────────────────────────────────────────────────────────
    var canvasEl = instance.canvas[0];
    canvasEl.style.width   = '100%';
    canvasEl.style.height  = '100%';
    canvasEl.style.display = 'block';

    var wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%;height:100%;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;background:' + BG_GLOBAL + ';display:flex;flex-direction:column;overflow:hidden;border-radius:inherit;';

    // Topbar
    var topbar = document.createElement('div');
    topbar.style.cssText = 'background:' + BG_SURFACE + ';border-bottom:1px solid ' + COLOR_BORDER + ';display:flex;align-items:center;height:' + TOPBAR_H + 'px;flex-shrink:0;padding:0 16px;gap:8px;';
    topbar.innerHTML =
      '<button id="' + uid + '-toggle" title="Masquer/afficher le panneau" style="width:32px;height:32px;border:1px solid ' + COLOR_BORDER + ';border-radius:5px;background:none;cursor:pointer;color:' + COLOR_TEXT_2 + ';font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">☰</button>' +
      '<span style="font-size:14px;font-weight:700;color:' + COLOR_TEXT + ';flex:1;">' + PLUGIN_TITLE + '</span>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<button id="' + uid + '-prev" style="width:32px;height:32px;border:1px solid ' + COLOR_BORDER + ';border-radius:5px;background:none;cursor:pointer;color:' + PRIMARY + ';font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;">‹</button>' +
        '<span id="' + uid + '-title" style="font-size:15px;font-weight:700;color:' + COLOR_TEXT + ';min-width:160px;text-align:center;"></span>' +
        '<button id="' + uid + '-next" style="width:32px;height:32px;border:1px solid ' + COLOR_BORDER + ';border-radius:5px;background:none;cursor:pointer;color:' + PRIMARY + ';font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;">›</button>' +
        '<button id="' + uid + '-today" style="height:32px;padding:0 12px;border:1px solid ' + COLOR_BORDER + ';border-radius:5px;background:none;cursor:pointer;color:' + PRIMARY + ';font-size:12px;font-weight:600;white-space:nowrap;font-family:inherit;">Aujourd\'hui</button>' +
        '<button id="' + uid + '-we" style="height:32px;padding:0 10px;border:1px solid ' + COLOR_BORDER + ';border-radius:5px;background:none;cursor:pointer;color:' + COLOR_TEXT_2 + ';font-size:11px;font-weight:600;white-space:nowrap;font-family:inherit;">7j</button>' +
      '</div>' +
      '<div style="flex:1;"></div>';

    // Corps
    var body = document.createElement('div');
    body.style.cssText = 'flex:1;display:flex;overflow:hidden;min-height:0;';

    // Panneau gauche
    var leftPanel = document.createElement('div');
    leftPanel.id = uid + '-lp';
    leftPanel.style.cssText = 'width:' + LEFT_W + 'px;min-width:' + LEFT_W + 'px;display:flex;flex-direction:column;border-right:1px solid ' + COLOR_BORDER_STR + ';background:' + BG_SURFACE + ';z-index:2;overflow:hidden;transition:width 0.2s,min-width 0.2s;';

    var leftHdr = document.createElement('div');
    leftHdr.style.cssText = 'height:' + DAY_H + 'px;background:' + BG_HEADER + ';border-bottom:2px solid ' + COLOR_BORDER_STR + ';display:flex;align-items:center;padding:0 16px;flex-shrink:0;box-sizing:border-box;';
    leftHdr.innerHTML = '<span style="font-size:10px;font-weight:700;color:' + PRIMARY + ';text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;">Équipes</span>';

    // Barre de recherche — hauteur fixe SEARCH_H pour rester aligné avec dayHdr droit
    var leftSearch = document.createElement('div');
    leftSearch.style.cssText = 'height:' + SEARCH_H + 'px;padding:7px 10px;border-bottom:1px solid ' + COLOR_BORDER + ';background:' + BG_SURFACE + ';flex-shrink:0;box-sizing:border-box;';
    leftSearch.innerHTML =
      '<div style="display:flex;align-items:center;gap:6px;background:' + BG_GLOBAL + ';border:1px solid ' + COLOR_BORDER + ';border-radius:5px;padding:0 8px;height:100%;box-sizing:border-box;">' +
        '<span style="color:' + COLOR_TEXT_2 + ';font-size:12px;flex-shrink:0;">⌕</span>' +
        '<input id="' + uid + '-search" type="text" placeholder="Rechercher…" style="border:none;background:transparent;outline:none;font-size:11px;color:' + COLOR_TEXT + ';width:100%;font-family:inherit;">' +
        '<button id="' + uid + '-clear" style="border:none;background:none;cursor:pointer;color:' + COLOR_TEXT_2 + ';font-size:13px;line-height:1;padding:0;flex-shrink:0;display:none;opacity:0.6;" title="Effacer">×</button>' +
      '</div>';

    var leftRows = document.createElement('div');
    leftRows.id = uid + '-lr';
    leftRows.style.cssText = 'flex:1;overflow-y:hidden;overflow-x:hidden;';

    leftPanel.appendChild(leftHdr);
    leftPanel.appendChild(leftSearch);
    leftPanel.appendChild(leftRows);

    // Panneau droit
    var rightPanel = document.createElement('div');
    rightPanel.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;';

    // dayHdr = DAY_H + SEARCH_H pour compenser la search bar du panneau gauche
    var dayHdr = document.createElement('div');
    dayHdr.id = uid + '-dh';
    dayHdr.style.cssText = 'height:' + (DAY_H + SEARCH_H) + 'px;background:' + BG_HEADER + ';border-bottom:2px solid ' + COLOR_BORDER_STR + ';position:relative;flex-shrink:0;box-sizing:border-box;overflow-y:auto;scrollbar-gutter:stable;';

    var timeline = document.createElement('div');
    timeline.id = uid + '-tl';
    timeline.style.cssText = 'flex:1;overflow-y:auto;overflow-x:hidden;position:relative;scrollbar-gutter:stable;';

    rightPanel.appendChild(dayHdr);
    rightPanel.appendChild(timeline);
    body.appendChild(leftPanel);
    body.appendChild(rightPanel);
    wrap.appendChild(topbar);
    wrap.appendChild(body);
    instance.canvas.append(wrap);

    // ─── TOOLTIP ─────────────────────────────────────────────────────────────────
    var tip = document.createElement('div');
    tip.style.cssText = [
      'position:fixed',
      'background:' + TOOLTIP_BG,
      'color:' + TOOLTIP_TXT,
      'font-size:11px',
      'font-weight:600',
      'padding:5px 10px',
      'border-radius:5px',
      'max-width:250px',
      'white-space:normal',
      'word-break:break-word',
      'pointer-events:none',
      'z-index:99999',
      'opacity:0',
      'transition:opacity 0.08s ease',
      'box-shadow:0 4px 12px rgba(0,0,0,0.18)',
      'font-family:Inter,-apple-system,sans-serif',
      'line-height:1.4',
    ].join(';') + ';';
    document.body.appendChild(tip);

    // Delegation sur la timeline — affiche le tooltip sur les ITEMs (data-tip)
    timeline.addEventListener('mouseover', function(e) {
      var el = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!el) return;
      var parts = el.getAttribute('data-tip').split('||');
      var label = parts[0].replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var info  = (parts[1] || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      tip.innerHTML = '<span>' + label + '</span>' + (info ? '<br><span style="white-space:nowrap;opacity:0.8;">' + info + '</span>' : '');
      tip.style.opacity = '1';
    });
    timeline.addEventListener('mousemove', function(e) {
      tip.style.left = (e.clientX + 14) + 'px';
      tip.style.top  = (e.clientY - 36) + 'px';
    });
    timeline.addEventListener('mouseout', function(e) {
      var el = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!el) return;
      tip.style.opacity = '0';
    });
    // Cache le tooltip si on quitte la timeline
    timeline.addEventListener('mouseleave', function() {
      tip.style.opacity = '0';
    });

    // ─── SKELETON LOADER ─────────────────────────────────────────────────────────
    instance.data.renderSkeleton = function() {
      if (!document.getElementById(uid + '-skst')) {
        var st = document.createElement('style');
        st.id = uid + '-skst';
        st.textContent = '@keyframes ' + uid + 'sk{0%{background-position:-200% 0}100%{background-position:200% 0}}';
        document.head.appendChild(st);
      }
      var SH = 'background:linear-gradient(90deg,#eef0f3 25%,#e2e5ea 50%,#eef0f3 75%);background-size:200% 100%;animation:' + uid + 'sk 1.4s ease-in-out infinite;border-radius:4px;';

      var y  = instance.data.year;
      var m  = instance.data.month;
      var ND = new Date(y, m + 1, 0).getDate();

      document.getElementById(uid + '-title').textContent = MONTHS_FR[m] + ' ' + y;

      // En-tête jours — shimmer
      var dhHtml = '';
      for (var d = 1; d <= ND; d++) {
        var dow  = new Date(y, m, d).getDay();
        var isWE = dow === 0 || dow === 6;
        dhHtml += '<div style="position:absolute;left:' + ((d-1)/ND*100).toFixed(4) + '%;width:' + (1/ND*100).toFixed(4) + '%;bottom:0;height:' + DAY_H + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;' + (isWE ? 'background:' + BG_HEADER + ';' : '') + '">' +
          '<div style="width:12px;height:12px;' + SH + (isWE ? 'opacity:0.4;' : '') + '"></div>' +
        '</div>';
      }
      document.getElementById(uid + '-dh').innerHTML = dhHtml;

      // Panneau gauche — lignes shimmer
      var SKROWS = [
        { type:'header' }, { type:'emp' }, { type:'emp' }, { type:'emp' }, { type:'emp' },
        { type:'header' }, { type:'emp' }, { type:'emp' },
      ];
      var lrHtml = '';
      SKROWS.forEach(function(r) {
        if (r.type === 'header') {
          lrHtml += '<div style="height:' + HDR_H + 'px;background:' + BG_HEADER + ';border-bottom:1px solid ' + COLOR_BORDER_STR + ';display:flex;align-items:center;padding:0 12px;">' +
            '<div style="width:72px;height:9px;' + SH + '"></div></div>';
        } else {
          lrHtml += '<div style="height:' + ROW_H + 'px;border-bottom:1px solid ' + COLOR_BORDER + ';display:flex;align-items:center;padding:0 12px;gap:10px;">' +
            '<div style="width:30px;height:30px;border-radius:50%;flex-shrink:0;' + SH + '"></div>' +
            '<div style="flex:1;height:10px;' + SH + '"></div>' +
          '</div>';
        }
      });
      document.getElementById(uid + '-lr').innerHTML = lrHtml;

      // Timeline — barres shimmer
      var totalSkH = HDR_H + 4*ROW_H + HDR_H + 2*ROW_H;
      var BARS = [
        { row:1, s:1,  e:18, w:0.5 }, { row:1, s:21, e:30, w:0.4 },
        { row:2, s:3,  e:14, w:0.6 }, { row:3, s:1,  e:9,  w:0.5 },
        { row:3, s:18, e:30, w:0.45 },{ row:4, s:5,  e:24, w:0.55 },
        { row:6, s:2,  e:20, w:0.5 }, { row:7, s:8,  e:30, w:0.5 },
      ];
      var rowTops = [0, HDR_H, HDR_H+ROW_H, HDR_H+2*ROW_H, HDR_H+3*ROW_H,
                     HDR_H+4*ROW_H, HDR_H+4*ROW_H+HDR_H, HDR_H+4*ROW_H+HDR_H+ROW_H];
      var tlHtml = '<div style="position:relative;width:100%;height:' + totalSkH + 'px;">';
      SKROWS.forEach(function(r, i) {
        var top = rowTops[i] || 0;
        var h   = r.type === 'header' ? HDR_H : ROW_H;
        var bg  = r.type === 'header' ? BG_HEADER : 'transparent';
        tlHtml += '<div style="position:absolute;left:0;right:0;top:' + top + 'px;height:' + h + 'px;background:' + bg + ';border-bottom:1px solid ' + COLOR_BORDER + ';pointer-events:none;"></div>';
      });
      BARS.forEach(function(b) {
        var top   = (rowTops[b.row] || 0) + ITEM_MARGIN;
        var left  = ((b.s - 1) / ND * 100).toFixed(3);
        var width = ((b.e - b.s + 1) / ND * 100).toFixed(3);
        var barH  = ROW_H - ITEM_MARGIN * 2;
        tlHtml += '<div style="position:absolute;left:calc(' + left + '% + 2px);top:' + top + 'px;width:calc(' + width + '% - 4px);height:' + barH + 'px;border-radius:' + ITEM_RADIUS + 'px;z-index:3;' + SH + 'opacity:' + b.w + ';"></div>';
      });
      tlHtml += '</div>';
      document.getElementById(uid + '-tl').innerHTML = tlHtml;
    };

    // ─── RENDER ───────────────────────────────────────────────────────────────────
    instance.data.render = function() {
      var y    = instance.data.year;
      var m    = instance.data.month;
      var rows = instance.data.buildRows();
      instance.data._lastRows = rows;

      var ND   = new Date(y, m + 1, 0).getDate();
      var today = new Date();
      var isCurrentMonth = today.getFullYear() === y && today.getMonth() === m;
      var todayDay = today.getDate();
      var assignments = instance.data.assignments || [];
      var showWE = instance.data.showWeekends;

      // Jours off du mois courant
      var offSet = {};
      (instance.data.joursOff || []).forEach(function(d) {
        if (d.getFullYear() === y && d.getMonth() === m) offSet[d.getDate()] = true;
      });

      // Colonnes visibles (tous les jours, ou seulement jours ouvrés)
      var visDays = [];
      for (var d = 1; d <= ND; d++) {
        var dow = new Date(y, m, d).getDay();
        if (showWE || (dow !== 0 && dow !== 6)) visDays.push(d);
      }
      var NC = visDays.length;
      instance.data._visDays = visDays;
      instance.data._NC      = NC;

      // Helpers de positionnement sur les colonnes visibles
      function colIdx(d) {
        // Index du premier jour visible >= d
        for (var i = 0; i < visDays.length; i++) { if (visDays[i] >= d) return i; }
        return NC;
      }
      function colIdxRight(d) {
        // Index (exclusif) après le dernier jour visible <= d
        for (var i = visDays.length - 1; i >= 0; i--) { if (visDays[i] <= d) return i + 1; }
        return 0;
      }
      function pctLeft(d)        { return (colIdx(d)      / NC * 100).toFixed(3); }
      function pctWidth(s, e)    { return ((colIdxRight(e) - colIdx(s)) / NC * 100).toFixed(3); }
      function pctCenter(d)      { return ((colIdx(d) + 0.5) / NC * 100).toFixed(3); }

      document.getElementById(uid + '-title').textContent = MONTHS_FR[m] + ' ' + y;

      // Mettre à jour le bouton weekend
      var weBtn = document.getElementById(uid + '-we');
      if (weBtn) weBtn.textContent = showWE ? '5j' : '7j';

      // ── En-tête jours
      var dhHtml = '';
      visDays.forEach(function(d, idx) {
        var dow   = new Date(y, m, d).getDay();
        var isTod = isCurrentMonth && d === todayDay;
        var isOff = !!offSet[d];
        var isWE  = dow === 0 || dow === 6;
        var bg     = isTod ? PRIMARY_CONTRAST : isOff ? '#FFFBEB' : isWE ? '#E2E8F0' : '';
        var txtCol = isTod ? PRIMARY : isOff ? '#D97706' : isWE ? '#CBD5E1' : COLOR_TEXT_2;
        var subCol = isTod ? PRIMARY : isOff ? '#FCD34D' : isWE ? '#CBD5E1' : '#94A3B8';
        dhHtml +=
          '<div data-day="' + d + '" style="position:absolute;left:' + (idx/NC*100).toFixed(4) + '%;width:' + (1/NC*100).toFixed(4) + '%;bottom:0;height:' + DAY_H + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;border-right:1px solid ' + BG_GLOBAL + ';cursor:default;' + (bg ? 'background:' + bg + ';' : '') + '">' +
            '<span style="font-size:10px;font-weight:' + (isWE && !isOff ? '400' : '700') + ';color:' + txtCol + ';line-height:1.2;pointer-events:none;">' + d + '</span>' +
            '<span style="font-size:7px;color:' + subCol + ';line-height:1.2;pointer-events:none;">' + DAYS_FR[dow] + '</span>' +
          '</div>';
      });
      document.getElementById(uid + '-dh').innerHTML = dhHtml;

      // ── Panneau gauche
      var lrHtml = '';
      rows.forEach(function(row, ri) {
        if (row.type === 'header') {
          var isOpen  = row.section === 'collabs' ? instance.data.showCollabs : instance.data.showSubs;
          var chevron = isOpen ? '▾' : '▸';
          var badgeN  = row.count !== undefined ? row.count : 0;
          var badgeLabel = (instance.data.searchQuery && row.count !== row.total)
            ? badgeN + '/' + row.total : '' + badgeN;
          lrHtml +=
            '<div data-rowidx="' + ri + '" id="' + uid + '-sh-' + row.section + '" style="height:' + HDR_H + 'px;background:' + BG_HEADER + ';border-bottom:1px solid ' + COLOR_BORDER_STR + ';display:flex;align-items:center;padding:0 12px;gap:6px;cursor:pointer;user-select:none;">' +
              '<span style="font-size:9px;color:' + PRIMARY + ';pointer-events:none;">' + chevron + '</span>' +
              '<span style="font-size:9px;font-weight:700;color:' + PRIMARY + ';text-transform:uppercase;letter-spacing:.08em;pointer-events:none;">' + row.label + '</span>' +
              '<span style="margin-left:auto;background:' + PRIMARY_CONTRAST + ';color:' + PRIMARY + ';font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px;min-width:18px;text-align:center;pointer-events:none;">' + badgeLabel + '</span>' +
            '</div>';
        } else {
          var color    = EMP_COLORS[row.colorIdx % EMP_COLORS.length];
          var initials = row.emp.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
          lrHtml +=
            '<div data-rowidx="' + ri + '" style="height:' + ROW_H + 'px;border-bottom:1px solid ' + COLOR_BORDER + ';display:flex;align-items:center;padding:0 12px;gap:10px;cursor:default;">' +
              '<div style="width:30px;height:30px;border-radius:50%;background:' + color + ';color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;pointer-events:none;">' + initials + '</div>' +
              '<span style="font-size:12px;font-weight:500;color:' + COLOR_TEXT + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;">' + row.emp.name + '</span>' +
            '</div>';
        }
      });
      document.getElementById(uid + '-lr').innerHTML = lrHtml;

      var shCollabs = document.getElementById(uid + '-sh-collabs');
      if (shCollabs) shCollabs.addEventListener('click', function() {
        instance.data.showCollabs = !instance.data.showCollabs;
        instance.data.render();
      });
      var shSubs = document.getElementById(uid + '-sh-subs');
      if (shSubs) shSubs.addEventListener('click', function() {
        instance.data.showSubs = !instance.data.showSubs;
        instance.data.render();
      });

      // ── Timeline
      var html = '';

      // Fond week-end (seulement en mode 7j)
      if (showWE) {
        for (var d = 1; d <= ND; d++) {
          var dow = new Date(y, m, d).getDay();
          if (dow === 0 || dow === 6)
            html += '<div style="position:absolute;left:' + pctLeft(d) + '%;top:0;bottom:0;width:' + (1/NC*100).toFixed(3) + '%;background:rgba(203,213,225,0.25);pointer-events:none;z-index:0;"></div>';
        }
      }

      // Jours off
      visDays.forEach(function(d, idx) {
        if (offSet[d])
          html += '<div style="position:absolute;left:' + (idx/NC*100).toFixed(3) + '%;top:0;bottom:0;width:' + (1/NC*100).toFixed(3) + '%;background:rgba(251,191,36,0.18);border-left:1.5px solid rgba(217,119,6,0.25);border-right:1.5px solid rgba(217,119,6,0.25);box-sizing:border-box;pointer-events:none;z-index:1;"></div>';
      });

      // Séparateurs semaine (lundi visible)
      visDays.forEach(function(d, idx) {
        if (new Date(y, m, d).getDay() === 1)
          html += '<div style="position:absolute;left:' + (idx/NC*100).toFixed(3) + '%;top:0;bottom:0;width:1px;background:' + COLOR_BORDER + ';z-index:1;pointer-events:none;"></div>';
      });

      // Fond des lignes
      rows.forEach(function(row, i) {
        var top = instance.data.rowTop(rows, i);
        var h   = row.type === 'header' ? HDR_H : ROW_H;
        if (row.type === 'header') {
          html += '<div style="position:absolute;left:0;right:0;top:' + top + 'px;height:' + h + 'px;background:' + BG_HEADER + ';border-bottom:1px solid ' + COLOR_BORDER_STR + ';z-index:2;pointer-events:none;"></div>';
        } else {
          html += '<div style="position:absolute;left:0;right:0;top:' + top + 'px;height:' + h + 'px;border-bottom:1px solid ' + COLOR_BORDER + ';z-index:0;"></div>';
        }
      });

      // ── ITEMs
      var MONTHS_SHORT = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
      var firstOfMonth = new Date(y, m, 1);
      var lastOfMonth  = new Date(y, m + 1, 0);

      rows.forEach(function(row, i) {
        if (row.type !== 'emp') return;
        var rowTopPx = instance.data.rowTop(rows, i);

        var rawVisible = assignments.filter(function(a) {
          return a.emp === row.emp.id && a.end >= firstOfMonth && a.start <= lastOfMonth;
        });

        // Continuité visuelle en mode 5j : fusionner les segments séparés uniquement par des weekends
        var visible;
        if (!showWE) {
          var groups = {};
          rawVisible.forEach(function(a) {
            var k = a.label + '||' + a.emp;
            if (!groups[k]) groups[k] = [];
            groups[k].push(a);
          });
          visible = [];
          Object.keys(groups).forEach(function(k) {
            var segs = groups[k].slice().sort(function(a, b) { return a.start - b.start; });
            var cur = null;
            segs.forEach(function(seg) {
              if (!cur) { cur = { start: seg.start, end: seg.end, ref: seg }; return; }
              // Vérifier que le gap entre cur.end et seg.start ne contient que des weekends
              var nxt = new Date(cur.end.getTime() + 86400000);
              var onlyWE = true;
              while (nxt < seg.start) {
                var dow = nxt.getDay();
                if (dow !== 0 && dow !== 6) { onlyWE = false; break; }
                nxt = new Date(nxt.getTime() + 86400000);
              }
              if (onlyWE) {
                cur.end = seg.end;
              } else {
                visible.push({ emp: cur.ref.emp, label: cur.ref.label, start: cur.start, end: cur.end, tipDebut: cur.ref.tipDebut, tipFin: cur.ref.tipFin, tipDuree: cur.ref.tipDuree });
                cur = { start: seg.start, end: seg.end, ref: seg };
              }
            });
            if (cur) visible.push({ emp: cur.ref.emp, label: cur.ref.label, start: cur.start, end: cur.end, tipDebut: cur.ref.tipDebut, tipFin: cur.ref.tipFin, tipDuree: cur.ref.tipDuree });
          });
        } else {
          visible = rawVisible;
        }

        // Greedy track assignment
        var trackEnds = [];
        visible.sort(function(a, b) { return a.start - b.start; });
        visible.forEach(function(a) {
          var t = -1;
          for (var k = 0; k < trackEnds.length; k++) {
            if (trackEnds[k] < a.start) { t = k; break; }
          }
          if (t === -1) { t = trackEnds.length; trackEnds.push(null); }
          trackEnds[t] = a.end;
          a._renderTrack = t;
        });
        visible.forEach(function(a) {
          var maxT = a._renderTrack;
          visible.forEach(function(b) {
            if (b !== a && b.start <= a.end && b.end >= a.start)
              maxT = Math.max(maxT, b._renderTrack);
          });
          a._localTotalTracks = maxT + 1;
        });

        visible.forEach(function(a) {
          var sDay = a.start >= firstOfMonth ? a.start.getDate() : visDays[0];
          var eDay = a.end   <= lastOfMonth  ? a.end.getDate()   : visDays[visDays.length - 1];

          var label       = a.label || '?';
          var totalTracks = a._localTotalTracks || 1;
          var track       = a._renderTrack || 0;
          var cs          = instance.data.getChColors(label);

          var barArea = ROW_H - ITEM_MARGIN * 2;
          var gap     = totalTracks > 1 ? ITEM_GAP : 0;
          var barH    = Math.floor((barArea - gap * (totalTracks - 1)) / totalTracks);
          var barTop  = rowTopPx + ITEM_MARGIN + track * (barH + gap);

          var left  = pctLeft(sDay);
          var width = pctWidth(sDay, eDay);

          var fmtDate = function(raw) {
            var d = new Date(raw);
            return isNaN(d) ? '' : d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()];
          };
          var tipInfo = (a.tipDebut ? fmtDate(a.tipDebut) : '')
            + (a.tipFin   ? ' → ' + fmtDate(a.tipFin) : '')
            + (a.tipDuree != null ? ' (' + a.tipDuree + 'j)' : '');
          var tipTxt = label + (tipInfo ? '||' + tipInfo : '');

          html +=
            '<div data-tip="' + tipTxt.replace(/"/g, '&quot;') + '" ' +
            'style="position:absolute;left:calc(' + left + '% + 2px);top:' + barTop + 'px;width:calc(' + width + '% - 4px);height:' + barH + 'px;' +
            'background:' + cs.bg + ';border:1.5px solid ' + cs.bdr + ';border-radius:' + ITEM_RADIUS + 'px;' +
            'overflow:hidden;z-index:3;display:flex;align-items:center;padding:0 6px;box-sizing:border-box;cursor:default;">' +
              '<span style="font-size:' + ITEM_FONT + 'px;font-weight:600;color:' + cs.txt + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + label + '</span>' +
            '</div>';
        });
      });

      // Ligne aujourd'hui
      if (isCurrentMonth) {
        var todayInVis = visDays.indexOf(todayDay) !== -1;
        if (todayInVis || showWE) {
          html +=
            '<div style="position:absolute;left:' + pctCenter(todayDay) + '%;top:0;bottom:0;width:2px;background:' + PRIMARY + ';z-index:10;pointer-events:none;">' +
              '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);background:' + PRIMARY + ';color:white;font-size:7px;font-weight:800;padding:2px 4px;border-radius:0 0 4px 4px;white-space:nowrap;">Auj.</div>' +
            '</div>';
        }
      }

      html +=
        '<div id="' + uid + '-col-hl" style="position:absolute;top:0;bottom:0;left:0;width:0;background:rgba(99,102,241,0.07);pointer-events:none;z-index:5;display:none;"></div>' +
        '<div id="' + uid + '-row-hl" style="position:absolute;left:0;right:0;top:0;height:' + ROW_H + 'px;background:rgba(99,102,241,0.07);pointer-events:none;z-index:5;display:none;"></div>';

      var totalH = instance.data.rowTop(rows, rows.length);
      document.getElementById(uid + '-tl').innerHTML =
        '<div style="position:relative;width:100%;height:' + totalH + 'px;">' + html + '</div>';
    };

    // ─── NAVIGATION MOIS ──────────────────────────────────────────────────────────
    function publishMonth() {
      var d = new Date(instance.data.year, instance.data.month, 1, 0, 0, 0, 0);
      instance.publishState('selected_date', d);
      instance.triggerEvent('date_changed');
    }

    function navRender() {
      if (instance.data.usingRealData) instance.data.render();
      else instance.data.renderSkeleton();
    }

    document.getElementById(uid + '-prev').addEventListener('click', function() {
      instance.data.month--;
      if (instance.data.month < 0) { instance.data.month = 11; instance.data.year--; }
      navRender(); publishMonth();
    });
    document.getElementById(uid + '-next').addEventListener('click', function() {
      instance.data.month++;
      if (instance.data.month > 11) { instance.data.month = 0; instance.data.year++; }
      navRender(); publishMonth();
    });
    document.getElementById(uid + '-today').addEventListener('click', function() {
      var n = new Date();
      instance.data.year  = n.getFullYear();
      instance.data.month = n.getMonth();
      navRender(); publishMonth();
    });

    document.getElementById(uid + '-we').addEventListener('click', function() {
      instance.data.showWeekends = !instance.data.showWeekends;
      if (instance.data.usingRealData) instance.data.render();
      else instance.data.renderSkeleton();
    });

    // ─── HIGHLIGHT COLONNE (hover en-tête jour) ───────────────────────────────────
    dayHdr.addEventListener('mouseover', function(e) {
      var el = e.target && e.target.closest && e.target.closest('[data-day]');
      if (!el) return;
      var d      = parseInt(el.getAttribute('data-day'));
      var vd     = instance.data._visDays;
      var nc     = instance.data._NC;
      if (!vd || !nc) return;
      var idx    = vd.indexOf(d);
      if (idx < 0) return;
      var colHl = document.getElementById(uid + '-col-hl');
      if (!colHl) return;
      colHl.style.left    = (idx / nc * 100).toFixed(3) + '%';
      colHl.style.width   = (1 / nc * 100).toFixed(3) + '%';
      colHl.style.display = 'block';
    });
    dayHdr.addEventListener('mouseleave', function() {
      var colHl = document.getElementById(uid + '-col-hl');
      if (colHl) colHl.style.display = 'none';
    });

    // ─── HIGHLIGHT LIGNE (hover panneau gauche) ───────────────────────────────────
    leftRows.addEventListener('mouseover', function(e) {
      var el = e.target && e.target.closest && e.target.closest('[data-rowidx]');
      if (!el) return;
      var idx  = parseInt(el.getAttribute('data-rowidx'));
      var rows = instance.data._lastRows;
      if (!rows || !rows[idx]) return;
      var top  = instance.data.rowTop(rows, idx);
      var h    = rows[idx].type === 'header' ? HDR_H : ROW_H;
      var rowHl = document.getElementById(uid + '-row-hl');
      if (!rowHl) return;
      rowHl.style.top     = top + 'px';
      rowHl.style.height  = h + 'px';
      rowHl.style.display = 'block';
    });
    leftRows.addEventListener('mouseleave', function() {
      var rowHl = document.getElementById(uid + '-row-hl');
      if (rowHl) rowHl.style.display = 'none';
    });

    // ─── RECHERCHE ────────────────────────────────────────────────────────────────
    var searchEl = document.getElementById(uid + '-search');
    var clearBtn  = document.getElementById(uid + '-clear');
    searchEl.addEventListener('input', function() {
      instance.data.searchQuery = this.value;
      clearBtn.style.display = this.value ? 'block' : 'none';
      if (instance.data.usingRealData) instance.data.render();
      else instance.data.renderSkeleton();
    });
    clearBtn.addEventListener('click', function() {
      searchEl.value = '';
      instance.data.searchQuery = '';
      clearBtn.style.display = 'none';
      searchEl.focus();
      if (instance.data.usingRealData) instance.data.render();
      else instance.data.renderSkeleton();
    });

    // ─── TOGGLE PANNEAU GAUCHE ────────────────────────────────────────────────────
    document.getElementById(uid + '-toggle').addEventListener('click', function() {
      var lp = document.getElementById(uid + '-lp');
      instance.data.leftVisible = !instance.data.leftVisible;
      if (instance.data.leftVisible) {
        lp.style.width       = LEFT_W + 'px';
        lp.style.minWidth    = LEFT_W + 'px';
        lp.style.borderRight = '1px solid ' + COLOR_BORDER_STR;
      } else {
        lp.style.width       = '0';
        lp.style.minWidth    = '0';
        lp.style.borderRight = 'none';
      }
    });

    // ─── SYNC SCROLL ─────────────────────────────────────────────────────────────
    timeline.addEventListener('scroll', function() {
      leftRows.scrollTop = timeline.scrollTop;
    });

    // ─── HAUTEUR DISPONIBLE ───────────────────────────────────────────────────────
    instance.data.setCanvasHeight = function() {
      var rect = instance.canvas[0].getBoundingClientRect();
      var h = Math.floor(window.innerHeight - rect.top - 16);
      if (h > 100) instance.canvas[0].style.height = h + 'px';
    };
    instance.data.setCanvasHeight();
    window.addEventListener('resize', instance.data.setCanvasHeight);

    // ─── RENDU INITIAL ────────────────────────────────────────────────────────────
    instance.data.renderSkeleton();
    publishMonth();
    instance.data.initialized = true;
  }