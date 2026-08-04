function(instance, context) {

  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'pc-' + instanceId;
  var id = instance.data.instanceName;
  var s  = '.' + id + ' ';

  /* ── CSS ─────────────────────────────────────────────────────────── */
  var svgSearch = '<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

  var css = [
    /* racine */
    '.' + id + '{display:flex;flex-direction:column;width:100%;height:100%;font-family:inherit;font-size:13px;color:#1e293b;background:#fff;overflow:hidden;}',
    s + '*{box-sizing:border-box;}',

    /* barre du haut */
    s + '.tb{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid #e2e8f0;flex-shrink:0;background:#fff;}',
    s + '.srch{display:flex;align-items:center;gap:7px;background:#f1f5f9;border-radius:8px;padding:5px 11px;flex:1;max-width:280px;}',
    s + '.srch input{border:none;background:none;outline:none;font-size:12px;color:#374151;width:100%;font-family:inherit;}',
    s + '.clear-btn{border:none;background:none;cursor:pointer;color:#94a3b8;font-size:14px;line-height:1;padding:0;flex-shrink:0;display:none;}',
    s + '.clear-btn:hover{color:#374151;}',
    s + '.aj{font-size:11px;font-weight:600;color:#64748b;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:3px 8px;cursor:pointer;line-height:1.4;white-space:nowrap;font-family:inherit;}',
    s + '.aj:hover{background:#f1f5f9;color:#374151;border-color:#94a3b8;}',
    s + '.we-btn{font-size:11px;font-weight:600;color:#64748b;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:3px 8px;cursor:pointer;line-height:1.4;white-space:nowrap;font-family:inherit;}',
    s + '.we-btn:hover{background:#f1f5f9;color:#374151;border-color:#94a3b8;}',
    s + '.we-btn.active{background:#fdf2f8;color:#e91e8c;border-color:#f9a8d4;}',
    s + '.chart-btn{font-size:11px;font-weight:600;color:#64748b;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:3px 8px;cursor:pointer;line-height:1.4;white-space:nowrap;font-family:inherit;}',
    s + '.chart-btn:hover{background:#f1f5f9;color:#374151;border-color:#94a3b8;}',
    s + '.chart-btn.active{background:#fdf2f8;color:#e91e8c;border-color:#f9a8d4;}',
    s + '.yr-btn{font-size:11px;font-weight:700;color:#64748b;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:3px 7px;cursor:pointer;line-height:1.4;font-family:inherit;}',
    s + '.yr-btn:hover{background:#f1f5f9;color:#374151;border-color:#94a3b8;}',
    s + '.yr-btn:disabled{opacity:.35;cursor:default;}',
    s + '.yr-label{font-size:12px;font-weight:700;color:#374151;min-width:34px;text-align:center;}',

    /* corps */
    s + '.bd{display:flex;flex:1;overflow:hidden;position:relative;}',

    /* panneau gauche (largeur via CSS var) */
    s + '.lp{width:var(--pc-lw,296px);flex-shrink:0;display:flex;flex-direction:column;border-right:2px solid #e2e8f0;background:#fff;z-index:3;}',
    s + '.lh{flex-shrink:0;border-bottom:2px solid #e2e8f0;position:relative;}',
    s + '.pl{overflow-y:hidden;flex:1;}',           /* scroll piloté par .rp */
    s + '.pr{display:flex;align-items:center;height:30px;padding:0 12px 0 10px;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#374151;cursor:pointer;gap:5px;}',
    s + '.pr:hover{background:#f8fafc;}',
    s + '.pr.sel{background:#fdf2f8;box-shadow:inset 3px 0 0 #e91e8c;}',
    s + '.pr.child{padding-left:26px;}',
    s + '.pr.child .pn{color:#64748b;font-weight:400;}',
    s + '.cg-row.sel{background:rgba(233,30,140,0.05);}',
    s + '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    s + '.chv{width:14px;height:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9px;cursor:pointer;transition:transform .12s;}',
    s + '.chv.open{transform:rotate(90deg);}',
    s + '.chv-ph{width:14px;flex-shrink:0;}',
    /* bouton "sélectionner ce chantier" — petit badge "i" toujours visible, discret mais repérable */
    s + '.pr-actions{margin-left:auto;flex-shrink:0;display:flex;align-items:center;gap:4px;}',
    s + '.sel-btn{flex-shrink:0;width:16px;height:16px;border:1.5px solid #cbd5e1;border-radius:50%;background:#fff;color:#94a3b8;font-size:9px;font-weight:800;font-style:italic;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .1s,color .1s,border-color .1s;}',
    s + '.sel-btn:hover{background:#e91e8c;border-color:#e91e8c;color:#fff;}',
    s + '.goto-btn{flex-shrink:0;width:16px;height:16px;border:1.5px solid #cbd5e1;border-radius:4px;background:#fff;color:#94a3b8;font-size:9px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .1s,color .1s,border-color .1s;}',
    s + '.goto-btn:hover{background:#eef2ff;border-color:#818cf8;color:#4f46e5;}',
    s + '.goto-btn.disabled{opacity:.3;cursor:default;pointer-events:none;}',

    /* panneau droit */
    s + '.rp{flex:1;overflow:auto;min-width:0;background:#fff;position:relative;cursor:grab;}',
    s + '.rp:active{cursor:grabbing;}',
    s + '.rp::-webkit-scrollbar{width:6px;height:6px;}',
    s + '.rp::-webkit-scrollbar-track{background:#f1f1f1;}',
    s + '.rp::-webkit-scrollbar-thumb{background:#e91e8c;border-radius:3px;}',
    s + '.mo-seps{position:absolute;top:0;left:0;width:0;height:0;pointer-events:none;z-index:6;}',
    s + '.mo-seps .ln{position:absolute;top:0;width:1px;background:#9ca3af;}',

    /* en-tête calendrier (sticky) */
    s + '.ch{position:sticky;top:0;background:#fff;z-index:10;width:max-content;min-width:100%;border-bottom:2px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.07);}',
    s + '.mr{display:flex;padding:4px 0 0;}',
    s + '.ms{display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:11px;font-weight:700;color:#111827;padding:0 4px;}',
    s + '.ms+.ms{border-left:2px solid #6b7280;}',

    /* groupes de semaines */
    s + '.wr{display:flex;}',
    s + '.wg{display:flex;gap:3px;flex-shrink:0;}',
    s + '.ws{flex-shrink:0;border-left:1px solid #e9eaec;}',

    /* colonnes de jours (en-tête uniquement) */
    s + '.dc{flex-shrink:0;text-align:center;}',
    s + '.dc.we{background:#f1f5f9;border-radius:3px;}',
    s + '.dc.jo{background:#fff3f3;border-radius:3px;}',
    s + '.dn{font-size:9.5px;color:#94a3b8;line-height:1.4;}',
    s + '.dc.we .dn,.dc.jo .dn{font-size:8.5px;color:#c0c2c9;}',
    s + '.dd{font-size:10px;font-weight:600;color:#64748b;line-height:1.6;}',
    s + '.dc.we .dd{font-size:9px;font-weight:500;color:#c0c2c9;}',
    s + '.dc.jo .dd{font-size:9px;font-weight:500;color:#e08080;}',
    s + '.dd.today{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;background:#e91e8c;color:#fff;border-radius:4px;line-height:1;}',

    /* rangée des compteurs (mise en avant : c\'est la donnée clé de la charge) */
    s + '.cr{display:flex;background:#fafafa;padding:4px 0;border-top:1px solid #eeeff1;}',
    s + '.cc{flex-shrink:0;text-align:center;font-size:13px;font-weight:800;line-height:1.1;}',
    s + '.cc[data-tip]{cursor:help;}',

    /* rangée des mois (toujours visible, indépendante du graphique) */
    s + '.mrow{position:relative;height:18px;background:#fff;border-bottom:1px solid #eeeff1;}',

    /* highlight colonne au survol du planning */
    s + '.col-hl{position:absolute;top:0;bottom:0;background:rgba(233,30,140,0.06);pointer-events:none;z-index:1;display:none;}',
    /* highlight ligne au survol de la liste gauche */
    s + '.row-hl{position:absolute;left:0;right:0;height:30px;background:rgba(148,163,184,0.14);pointer-events:none;z-index:1;display:none;}',
    /* étiquette explicative de la ligne compteurs */
    s + '.cr-lbl{position:absolute;right:10px;font-size:10px;font-weight:700;color:#e91e8c;white-space:nowrap;pointer-events:none;line-height:1;}',

    /* grille (items façon Gantt, positionnement absolu sur fond de colonnes) */
    s + '.cg{position:relative;}',
    s + '.cg-bg{position:absolute;top:0;bottom:0;pointer-events:none;}',
    s + '.cg-bg.we{background:#f1f5f9;}',
    s + '.cg-bg.jo{background:#fff3f3;}',
    s + '.cg-row{position:absolute;left:0;right:0;height:30px;border-bottom:1px solid #f1f5f9;}',
    s + '.item{position:absolute;top:4px;height:22px;border-radius:5px;overflow:hidden;display:flex;align-items:center;padding:0 6px;box-sizing:border-box;cursor:pointer;transition:box-shadow .1s ease,filter .1s ease;}',
    s + '.item:hover{box-shadow:0 1px 4px rgba(0,0,0,.12);filter:brightness(0.98);z-index:4;}',
    s + '.item span{font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;}',
    s + '.item .lbl{display:flex;align-items:center;min-width:0;will-change:transform;}',
    s + '.item.child{opacity:.85;top:5px;height:20px;}',
    s + '.item.lane{padding:0 4px;}',
    s + '.item.lane span{font-size:9px;}',
    /* item "chantier parent" (regroupement) : hachures + ombre + bordure tiretée pour le distinguer visuellement */
    s + '.item.group{background-color:#f1f5f9;border:1.5px dashed #94a3b8;box-shadow:0 1px 5px rgba(0,0,0,.12);background-image:repeating-linear-gradient(135deg,rgba(100,116,139,0.12) 0 6px,transparent 6px 12px);}',
    s + '.item.group:hover{box-shadow:0 2px 7px rgba(0,0,0,.18);}',
    s + '.item.group .grp-accent{position:absolute;left:0;top:0;bottom:0;width:4px;}',

    /* tooltip (appendé à document.body → règle NON scopée à la racine du plugin) */
    '.' + id + '-tip{position:fixed;background:#1e293b;color:#fff;font-size:11px;font-weight:600;padding:5px 10px;border-radius:5px;max-width:320px;white-space:pre-line;word-break:break-word;pointer-events:none;z-index:99999;opacity:0;transition:opacity .08s ease;box-shadow:0 4px 12px rgba(0,0,0,.18);line-height:1.5;font-family:inherit;}',

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
      '<div class="srch">' + svgSearch + '<input type="text" placeholder="nom chantier…"><button class="clear-btn" title="Effacer">×</button></div>' +
      '<button class="we-btn">7j</button>' +
      '<button class="chart-btn">Graphique</button>' +
      '<button class="yr-btn yr-prev" title="Année précédente">‹</button>' +
      '<span class="yr-label"></span>' +
      '<button class="yr-btn yr-next" title="Année suivante">›</button>' +
      '<button class="aj">Aujourd\'hui</button>' +
    '</div>' +
    '<div class="bd">' +
      '<div class="lp"><div class="lh"><span class="cr-lbl">Nb. équipes présentes sur chantier →</span></div><div class="pl"></div></div>' +
      '<div class="rp"><div class="ch"></div><div class="cg"></div><div class="mo-seps"></div></div>' +
      '<div class="ld"><div class="ls" style="animation:pcSpin_' + instanceId + ' .7s linear infinite"></div></div>' +
    '</div>';

  $(instance.canvas).append(root);

  /* ── Refs ─────────────────────────────────────────────────────────── */
  instance.data.root     = root;
  instance.data.srchInp  = root.querySelector('.srch input');
  instance.data.clearBtn = root.querySelector('.clear-btn');
  instance.data.leftHdr  = root.querySelector('.lh');
  instance.data.projList = root.querySelector('.pl');
  instance.data.calHdr   = root.querySelector('.ch');
  instance.data.calGrid  = root.querySelector('.cg');
  instance.data.moSeps   = root.querySelector('.mo-seps');
  instance.data.leftPnl  = root.querySelector('.lp');
  instance.data.rightPnl = root.querySelector('.rp');
  instance.data.loaderEl = root.querySelector('.ld');
  instance.data.todayBtn = root.querySelector('.aj');
  instance.data.weBtn    = root.querySelector('.we-btn');
  instance.data.chartBtn = root.querySelector('.chart-btn');
  instance.data.yrPrevBtn = root.querySelector('.yr-prev');
  instance.data.yrNextBtn = root.querySelector('.yr-next');
  instance.data.yrLabel   = root.querySelector('.yr-label');

  /* ── État hiérarchie / affichage ─────────────────────────────────── */
  instance.data.expanded        = {};    // { chantierId: true } → enfants visibles
  instance.data.showWeekends    = true;  // 7j par défaut
  instance.data.showChart       = false; // graphique masqué par défaut (gain de hauteur)
  instance.data.pendingSelectId = null;  // id cliqué avant que les vraies données Bubble soient arrivées
  instance.data.selectedYear    = null;  // seedé au 1er rendu (année en cours), fenêtre fixe d'un an

  /* ── Constantes calendrier (statiques, indépendantes des properties Bubble) ── */
  var CW          = 22;   // largeur cellule jour ouvré (px)
  var CWE         = 22;   // largeur cellule week-end (px)
  var CG          = 3;    // gap inter-cellules (px)
  var WS          = 8;    // séparateur de semaines (px)
  var RH          = 30;   // hauteur d'une ligne (sans voies multiples)
  var LANE_H      = 16;   // hauteur d'une voie (ligne enfant avec plusieurs chef_date simultanés)
  var LANE_PAD    = 3;    // marge haut/bas dans une ligne à voies multiples
  var HARD_START_YEAR  = 2026;             // 1ère année d'utilisation de l'app
  var HARD_START_MONTH = 2;                // mars (0-indexé) — pas de données avant
  var MIN_YEAR          = HARD_START_YEAR; // on ne peut pas naviguer avant
  var NEUTRAL_COLOR     = '#94a3b8';       // couleur fixe des items (plus de couleur par chef)
  var JOURS       = ['Di', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa'];
  var MOIS        = ['Janv', 'Fev', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Aout', 'Sept', 'Oct', 'Nov', 'Dec'];
  var MONTHS_SHORT = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

  function d0(dt) {
    if (!dt) return null;
    var d = new Date(dt); d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtDate(dt) { return dt.getDate() + ' ' + MONTHS_SHORT[dt.getMonth()]; }
  function bgTint(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex + '22' : 'rgba(148,163,184,0.15)';
  }

  /* ── Cache localStorage (rendu instantané au chargement, avant même la réponse Bubble) ──
     Clé namespacée par URL de page — pas de property dispo dans initialize.js pour la scoper autrement. */
  var CACHE_KEY = 'pcCache_' + location.pathname;
  instance.data.loadCache = function() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };
  instance.data.saveCache = function(payload) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch (e) { /* quota / navigation privée */ }
  };

  /* ══════════════════════════════════════════════════════════════
     RENDU PARTAGÉ — reçoit des données déjà normalisées (JS pur, pas d'objets Bubble
     obligatoires) : utilisable aussi bien depuis le cache (au chargement, avant que Bubble
     ait répondu) que depuis update.js (vraies données). `ch.raw` peut être absent (cache) :
     dans ce cas le clic sur un item ne peut pas encore publier l'état à Bubble.
     ══════════════════════════════════════════════════════════════ */
  instance.data.renderPlanning = function(chantiersAll, childrenMap, chantiers, chefDates, offSet, cfg) {
    instance.data._lastArgs = [chantiersAll, childrenMap, chantiers, chefDates, offSet, cfg];

    var maxCh         = cfg.maxCh;
    var couleurAlerte = cfg.couleurAlerte;
    var couleurDanger = cfg.couleurDanger;
    var couleurLimite = cfg.couleurLimite;
    var seuilAlerte   = cfg.seuilAlerte;
    var chartH        = cfg.chartH;
    var couleurNormal = cfg.couleurNormal;

    var today = d0(new Date());

    // Seed unique (première fois seulement) : année en cours, fenêtre fixe d'un an.
    if (instance.data.selectedYear == null) {
      instance.data.selectedYear = today.getFullYear();
    }
    var y = instance.data.selectedYear;
    var yearStart = (y === HARD_START_YEAR)
      ? new Date(HARD_START_YEAR, HARD_START_MONTH, 1)
      : new Date(y, 0, 1);
    var yearEnd = new Date(y + 1, 0, 1); // exclusif

    instance.data.yrLabel.textContent  = y;
    instance.data.yrPrevBtn.disabled   = (y <= MIN_YEAR);

    var allDays = [];
    var cursor = new Date(yearStart);
    while (cursor < yearEnd) {
      var d   = new Date(cursor);
      var dow = d.getDay();
      allDays.push({
        d:         d,
        n:         JOURS[dow],
        num:       d.getDate(),
        m:         d.getMonth(),
        y:         d.getFullYear(),
        isWeekend: (dow === 0 || dow === 6),
        isOff:     !!offSet[d.toDateString()],
        isToday:   (d.toDateString() === today.toDateString()),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    var showWE = !!instance.data.showWeekends;
    var days   = showWE ? allDays : allDays.filter(function(day) { return !day.isWeekend; });

    // Groupes de semaines
    var weeks = [];
    days.forEach(function(day) {
      if (day.d.getDay() === 1 || !weeks.length) weeks.push([]);
      weeks[weeks.length - 1].push(day);
    });

    // Groupes de mois (pour l'en-tête)
    var moisSpans = [];
    days.forEach(function(day, idx) {
      var k = day.y + '-' + day.m;
      if (!moisSpans.length || moisSpans[moisSpans.length - 1].k !== k)
        moisSpans.push({ k: k, lbl: MOIS[day.m] + ' ' + String(day.y).slice(2), fi: idx, li: idx });
      moisSpans[moisSpans.length - 1].li = idx;
    });

    // Positions X + largeurs de chaque jour
    var dayX = [], dayW = [], curX = 0;
    weeks.forEach(function(wk, wi) {
      wk.forEach(function(day, di) {
        var w = day.isWeekend ? CWE : CW;
        dayX.push(curX);
        dayW.push(w);
        curX += w + (di < wk.length - 1 ? CG : 0);
      });
      if (wi < weeks.length - 1) curX += WS;
    });
    var totalW = curX;

    /* ── Compteurs de charge = nombre d'équipes présentes (jours ouvrés), basé sur chef_date ── */
    var chantierNameById = {};
    chantiersAll.forEach(function(c) { chantierNameById[c.id] = c.nom; });
    var counts = days.map(function() { return 0; });
    var countDetails = days.map(function() { return []; }); // debug : détail des chefs comptés par jour
    chefDates.forEach(function(cd) {
      days.forEach(function(day, di) {
        if (day.isWeekend || day.isOff) return;
        if (day.d >= cd.deb && day.d <= cd.fin) {
          counts[di]++;
          countDetails[di].push((cd.chefName || '(sans chef)') + ' — ' + (chantierNameById[cd.chantierId] || '?'));
        }
      });
    });

    /* ── Helper : construit le HTML semaine par semaine ──────────── */
    function byWeek(cellFn) {
      var di = 0;
      return weeks.map(function(wk, wi) {
        var cells = wk.map(function(day) { return cellFn(day, di++); }).join('');
        var sep   = wi < weeks.length - 1
          ? '<div class="ws" style="width:' + WS + 'px"></div>'
          : '';
        return '<div class="wg">' + cells + '</div>' + sep;
      }).join('');
    }

    /* ── Échelle Y + couleur des barres du graphique de charge ────── */
    var maxCount = 0;
    counts.forEach(function(n) { if (n > maxCount) maxCount = n; });
    var maxY = Math.max(maxCh, maxCount) * 1.25;
    if (maxY === 0) maxY = 10;

    function barColor(n) {
      if (n >= maxCh)       return couleurDanger;
      if (n >= seuilAlerte) return couleurAlerte;
      return couleurNormal;
    }

    /* ── En-tête calendrier ──────────────────────────────────────── */
    var nomHtml = byWeek(function(day) {
      var w   = day.isWeekend ? CWE : CW;
      var cls = 'dc' + (day.isWeekend ? ' we' : day.isOff ? ' jo' : '');
      return '<div class="' + cls + '" style="width:' + w + 'px"><div class="dn">' + day.n + '</div></div>';
    });

    var numHtml = byWeek(function(day) {
      var w   = day.isWeekend ? CWE : CW;
      var cls = 'dc' + (day.isWeekend ? ' we' : day.isOff ? ' jo' : '');
      var nc  = day.isToday ? 'dd today' : 'dd';
      return '<div class="' + cls + '" style="width:' + w + 'px"><div class="' + nc + '">' + day.num + '</div></div>';
    });

    var cntHtml = byWeek(function(day, di) {
      var w   = day.isWeekend ? CWE : CW;
      var n   = counts[di];
      var col = n >= maxCh ? '#d32f2f' : n > 0 ? '#9ca3af' : '#d9dbe0';
      var txt = n > 0 ? n : '';
      var tip = countDetails[di].length ? countDetails[di].map(function(t) { return '- ' + t; }).join('\n') : '';
      return '<div class="cc" style="width:' + w + 'px;color:' + col + '"' +
        (tip ? ' data-tip="' + tip.replace(/"/g, '&quot;') + '"' : '') + '>' + txt + '</div>';
    });

    /* Rangée graphe par jour */
    var lineTopPx = Math.round(chartH * (1 - maxCh / maxY));

    var dayMoIdx = [];
    moisSpans.forEach(function(ms, mi) {
      for (var di = ms.fi; di <= ms.li; di++) dayMoIdx[di] = mi;
    });

    // Labels de mois : toujours visibles, indépendants de l'affichage du graphique
    var moLabels = moisSpans.map(function(ms) {
      return '<span style="position:absolute;left:' + (dayX[ms.fi] + 4) + 'px;top:2px;' +
             'font-size:11px;font-weight:800;color:#111827;pointer-events:none;z-index:3;white-space:nowrap;">' +
             ms.lbl + '</span>';
    }).join('');
    var monthRowHtml = '<div class="mrow">' + moLabels + '</div>';

    var chartRowHtml = !instance.data.showChart ? '' :
      '<div style="position:relative;height:' + chartH + 'px;background:#fafafa;border-bottom:1px solid #eeeff1;">' +
        '<div class="wr">' +
          byWeek(function(day, di) {
            var w    = day.isWeekend ? CWE : CW;
            var n    = counts[di];
            var bh   = (!day.isWeekend && !day.isOff && n > 0) ? Math.round(chartH * n / maxY) : 0;
            var bgMo = (dayMoIdx[di] % 2 === 0) ? 'rgba(0,0,0,0.03)' : 'transparent';
            return '<div style="width:' + w + 'px;height:' + chartH + 'px;display:flex;align-items:flex-end;justify-content:center;background:' + bgMo + ';">' +
                   (bh > 0
                     ? '<div style="width:70%;height:' + bh + 'px;background:' + barColor(n) + ';border-radius:2px 2px 0 0;"></div>'
                     : '') +
                   '</div>';
          }) +
        '</div>' +
        '<div style="position:absolute;left:0;right:0;top:' + lineTopPx + 'px;height:2px;background:' + couleurLimite + ';pointer-events:none;z-index:2;"></div>' +
      '</div>';

    instance.data.calHdr.innerHTML =
      monthRowHtml +
      chartRowHtml +
      '<div class="wr">' + nomHtml + '</div>' +
      '<div class="wr">' + numHtml + '</div>' +
      '<div class="cr">' + cntHtml + '</div>';

    /* ── Synchronise hauteur de l'en-tête gauche ──────────────────── */
    var hdrH = instance.data.calHdr.offsetHeight;
    if (hdrH > 0) instance.data.leftHdr.style.height = hdrH + 'px';

    /* ── Positionne l'étiquette "Nb. équipes présentes" au niveau de la ligne compteurs ── */
    var crEl  = instance.data.calHdr.querySelector('.cr');
    var lblEl = instance.data.leftHdr.querySelector('.cr-lbl');
    if (crEl && lblEl) {
      lblEl.style.top = (crEl.offsetTop + crEl.offsetHeight / 2 - 5) + 'px';
    }

    /* ── Lignes affichées (parents + enfants dépliés), avec filtre recherche ──
       Le filtre est appliqué ICI, avant tout calcul de position, pour que la liste
       et la grille restent alignées sur le même jeu de lignes visibles (un simple
       masquage CSS après-coup désynchronise les deux panneaux).
       Règle : si un enfant matche la recherche, son parent reste visible (pour le
       contexte) même si le nom du parent lui-même ne matche pas, et l'enfant
       s'affiche automatiquement (pas besoin de déplier manuellement). ── */
    var searchQ = (instance.data.searchQuery || '').toLowerCase().trim();
    function matches(nom) { return !searchQ || nom.toLowerCase().indexOf(searchQ) !== -1; }

    var rows = [];
    chantiers.forEach(function(p) {
      var kids = childrenMap[p.id] || [];
      if (kids.length && instance.data.expanded[p.id] === undefined) {
        instance.data.expanded[p.id] = true; // déplié par défaut à la première apparition du parent
      }
      var parentMatches  = matches(p.nom);
      var matchingKids   = searchQ ? kids.filter(function(k) { return matches(k.nom); }) : kids;

      if (searchQ && !parentMatches && matchingKids.length === 0) { return; } // ni le parent ni ses enfants ne matchent

      rows.push({ type: 'parent', ch: p, hasKids: !!kids.length });

      var childrenToShow;
      if (!searchQ) {
        childrenToShow = instance.data.expanded[p.id] ? kids : [];
      } else if (parentMatches) {
        childrenToShow = instance.data.expanded[p.id] ? kids : []; // le parent est le résultat trouvé, on respecte le toggle
      } else {
        childrenToShow = matchingKids; // parent affiché uniquement pour contexte → on ne montre que les enfants trouvés
      }
      childrenToShow.forEach(function(k) { rows.push({ type: 'child', ch: k, parentId: p.id }); });
    });

    instance.data.rowsList = rows;

    /* ── Voies empilées : sur une ligne enfant, si plusieurs chef_date se chevauchent,
       on les répartit sur des voies (lanes) distinctes, comme des tâches concurrentes.
       Algorithme glouton : trié par date de début, chaque chef_date prend la première
       voie libre (dont le dernier chef_date placé se termine avant qu'il ne commence). ── */
    var chefDatesByChantier = {};
    chefDates.forEach(function(cd) {
      if (!chefDatesByChantier[cd.chantierId]) chefDatesByChantier[cd.chantierId] = [];
      chefDatesByChantier[cd.chantierId].push(cd);
    });
    function assignLanes(list) {
      var sorted = list.slice().sort(function(a, b) { return a.deb - b.deb; });
      var laneEnds = [];
      sorted.forEach(function(cd) {
        var placed = false;
        for (var l = 0; l < laneEnds.length; l++) {
          if (laneEnds[l] < cd.deb) { cd.lane = l; laneEnds[l] = cd.fin; placed = true; break; }
        }
        if (!placed) { cd.lane = laneEnds.length; laneEnds.push(cd.fin); }
      });
      return sorted;
    }
    var rowLanes = rows.map(function(row) {
      if (row.ch.hasChild) return null; // regroupement pur → pas de bande de chef
      var cds = chefDatesByChantier[row.ch.id];
      if (!cds || !cds.length) return null; // fallback : bande unique neutre
      return assignLanes(cds);
    });
    var rowHeights = rows.map(function(row, ri) {
      var lanes = rowLanes[ri];
      if (!lanes) return RH;
      var laneCount = 0;
      lanes.forEach(function(cd) { laneCount = Math.max(laneCount, cd.lane + 1); });
      return LANE_PAD * 2 + laneCount * LANE_H;
    });
    var rowTops = [];
    (function() { var acc = 0; rowHeights.forEach(function(h) { rowTops.push(acc); acc += h; }); })();
    instance.data.rowHeights = rowHeights;
    instance.data.rowTops    = rowTops;

    /* ── Fond de colonnes (week-ends / jours off), une fois pour toute la grille ── */
    var totalH = rowTops.length ? rowTops[rowTops.length - 1] + rowHeights[rowHeights.length - 1] : 0;
    var bgHtml = '';
    days.forEach(function(day, di) {
      if (day.isWeekend || day.isOff) {
        bgHtml += '<div class="cg-bg ' + (day.isWeekend ? 'we' : 'jo') + '" style="left:' + dayX[di] + 'px;width:' + dayW[di] + 'px;"></div>';
      }
    });

    /* ── Items (un par période de chantier) ────────────────────────── */
    function overlapRange(deb, fin) {
      if (!days.length || fin < days[0].d || deb > days[days.length - 1].d) return null;
      var startIdx = 0, endIdx = days.length - 1;
      if (deb > days[0].d) {
        for (var a = 0; a < days.length; a++) { if (days[a].d >= deb) { startIdx = a; break; } }
      }
      if (fin < days[days.length - 1].d) {
        for (var b = days.length - 1; b >= 0; b--) { if (days[b].d <= fin) { endIdx = b; break; } }
      }
      if (startIdx > endIdx) return null;
      return { startIdx: startIdx, endIdx: endIdx };
    }

    var rowsHtml = rows.map(function(row, ri) {
      var top = rowTops[ri];
      var items = '';
      // Un parent avec enfants = un regroupement, pas un chantier "de terrain" en soi :
      // on le marque visuellement (chevron, mention, hachures, ombre) et son item bascule
      // le déplié/replié au clic au lieu de sélectionner un chantier.
      var isGroup = (row.type === 'parent' && row.ch.hasChild);
      var isOpen  = isGroup && !!instance.data.expanded[row.ch.id];
      var lanes   = rowLanes[ri];

      if (lanes) {
        // Une bande par chef_date, empilée sur sa voie (couleur du chef, nom du chef dans le tag).
        lanes.forEach(function(cd) {
          var rg = overlapRange(cd.deb, cd.fin);
          if (!rg) return;
          if (row.scrollX == null) { row.scrollX = dayX[rg.startIdx]; }
          var left  = dayX[rg.startIdx] + 1;
          var width = (dayX[rg.endIdx] + dayW[rg.endIdx]) - dayX[rg.startIdx] - 2;
          if (width < 4) width = 4;
          var laneTop = LANE_PAD + cd.lane * LANE_H;
          var color   = cd.chefColor || NEUTRAL_COLOR;
          var dureeJ  = (cd.duree != null) ? cd.duree : Math.round((cd.fin.getTime() - cd.deb.getTime()) / 86400000) + 1;
          var tip = (cd.chefName || '(sans chef)') + ' — ' + row.ch.nom + ' — ' + fmtDate(cd.deb) + ' → ' + fmtDate(cd.fin) + ' (' + dureeJ + 'j)';
          var label = '<span style="color:#1e293b;">' + (cd.chefName || '(sans chef)') + '</span>';
          var styleAttr = 'left:' + left + 'px;width:' + width + 'px;top:' + laneTop + 'px;height:' + (LANE_H - 4) + 'px;' +
            'background:' + bgTint(color) + ';border:1.5px solid ' + color + ';';
          items +=
            '<div class="item child lane" data-ridx="' + ri + '" data-tip="' + tip.replace(/"/g, '&quot;') + '" ' +
            'data-left="' + left + '" data-width="' + width + '" style="' + styleAttr + '">' +
              '<div class="lbl">' + label + '</div>' +
            '</div>';
        });
      } else {
        row.ch.periods.forEach(function(p) {
          var rg = overlapRange(p.deb, p.fin);
          if (!rg) return;
          if (row.scrollX == null) { row.scrollX = dayX[rg.startIdx]; } // pour le bouton "aller à l'item"
          var left  = dayX[rg.startIdx] + 1;
          var width = (dayX[rg.endIdx] + dayW[rg.endIdx]) - dayX[rg.startIdx] - 2;
          if (width < 4) width = 4;
          var tip = isGroup
            ? row.ch.nom + ' (chantier parent) — cliquer pour déplier/replier les sous-chantiers'
            : row.ch.nom + ' — ' + fmtDate(p.deb) + ' → ' + fmtDate(p.fin);
          var label, styleAttr;
          if (isGroup) {
            label =
              '<span class="grp-accent" style="background:' + NEUTRAL_COLOR + ';"></span>' +
              '<span style="margin-left:5px;font-size:10px;">📁</span>' +
              '<span style="font-size:8px;margin:0 2px 0 4px;display:inline-block;transition:transform .12s;transform:rotate(' + (isOpen ? '90' : '0') + 'deg);color:#64748b;">▸</span>' +
              '<span style="color:#475569;font-style:italic;">' + row.ch.nom + ' (chantier parent)</span>';
            styleAttr = 'left:' + left + 'px;width:' + width + 'px;';
          } else {
            label = '<span style="color:#1e293b;">' + row.ch.nom + '</span>';
            styleAttr = 'left:' + left + 'px;width:' + width + 'px;background:' + bgTint(NEUTRAL_COLOR) + ';border:1.5px solid ' + NEUTRAL_COLOR + ';';
          }
          items +=
            '<div class="item' + (row.type === 'child' ? ' child' : '') + (isGroup ? ' group' : '') + '" data-ridx="' + ri + '" data-tip="' + tip.replace(/"/g, '&quot;') + '" ' +
            'data-left="' + left + '" data-width="' + width + '" style="' + styleAttr + '">' +
              '<div class="lbl">' + label + '</div>' +
            '</div>';
        });
      }
      return '<div class="cg-row" data-name="' + row.ch.nom.replace(/"/g, '&quot;') + '" style="top:' + top + 'px;height:' + rowHeights[ri] + 'px;">' + items + '</div>';
    }).join('');

    instance.data.calGrid.style.width  = totalW + 'px';
    instance.data.calGrid.style.height = totalH + 'px';
    instance.data.calGrid.innerHTML = bgHtml + '<div class="col-hl"></div><div class="row-hl"></div>' + rowsHtml;
    instance.data.colHlEl = instance.data.calGrid.querySelector('.col-hl');
    instance.data.rowHlEl = instance.data.calGrid.querySelector('.row-hl');
    instance.data._dayX = dayX;
    instance.data._dayW = dayW;
    if (instance.data.lastMouseX != null) { instance.data.updateColHl(instance.data.lastMouseX); }

    /* ── Séparateurs verticaux entre mois, du haut de l'en-tête jusqu'en bas de la grille ── */
    var sepH = hdrH + totalH;
    var sepHtml = moisSpans.slice(1).map(function(ms) {
      return '<div class="ln" style="left:' + dayX[ms.fi] + 'px;height:' + sepH + 'px;"></div>';
    }).join('');
    instance.data.moSeps.innerHTML = sepHtml;
    instance.data.updatePinnedLabels();

    /* ── Liste des projets (panneau gauche) ────────────────────────── */
    var projHtml = rows.map(function(row, ri) {
      var isGroupRow = (row.type === 'parent' && row.ch.hasChild);
      var chv = row.type === 'parent'
        ? (row.hasKids
            ? '<span class="chv' + (instance.data.expanded[row.ch.id] ? ' open' : '') + '" data-pid="' + row.ch.id + '">▸</span>'
            : '<span class="chv-ph"></span>')
        : '<span class="chv-ph"></span>';
      // Bouton "i" (sélectionner) : pas de sens sur un chantier parent, il n'y a rien à sélectionner (regroupement).
      var selBtn = isGroupRow ? '' : '<button class="sel-btn" data-idx="' + ri + '" title="Sélectionner ce chantier">i</button>';
      // Bouton "aller à l'item" : scroll direct vers la position de l'item dans le planning, désactivé si pas de dates.
      var hasGoto = row.scrollX != null;
      var gotoBtn = '<button class="goto-btn' + (hasGoto ? '' : ' disabled') + '" data-idx="' + ri + '" title="' + (hasGoto ? 'Aller à l’item' : 'Aucune date renseignée') + '">→</button>';
      return '<div class="pr' + (row.type === 'child' ? ' child' : '') + '" data-name="' + row.ch.nom.replace(/"/g, '&quot;') + '" data-idx="' + ri + '" style="height:' + rowHeights[ri] + 'px;">' +
               chv +
               '<div class="pn">' + row.ch.nom + '</div>' +
               '<span class="pr-actions">' + selBtn + gotoBtn + '</span>' +
             '</div>';
    }).join('');

    instance.data.projList.innerHTML = projHtml;
    // Re-sync scroll après innerHTML (le scrollTop peut être réinitialisé par le browser)
    instance.data.projList.scrollTop = instance.data.rightPnl.scrollTop;

    // Re-applique le highlight si un chantier était sélectionné avant le re-render
    if (instance.data.selectedIdx != null && instance.data.selectRow) {
      instance.data.selectRow(instance.data.selectedIdx);
    }

    /* ── Position X d'aujourd'hui + scroll initial (une seule fois) ── */
    var todayIdx = -1;
    for (var ti = 0; ti < days.length; ti++) {
      if (days[ti].isToday) { todayIdx = ti; break; }
    }
    instance.data.todayScrollX = todayIdx >= 0 ? dayX[todayIdx] : 0;
    if (!instance.data.hasScrolledToToday) {
      instance.data.rightPnl.scrollLeft = instance.data.todayScrollX;
      instance.data.hasScrolledToToday = true;
    }

    if (instance.data.loaderEl) { instance.data.loaderEl.style.display = 'none'; }
  };

  instance.data.reRender = function() {
    if (instance.data._lastArgs) { instance.data.renderPlanning.apply(null, instance.data._lastArgs); }
  };

  /* ── Tooltip (partagé entre la grille des items et l'en-tête, ex: détail du compteur d'équipes) ── */
  var tip = document.createElement('div');
  tip.className = id + '-tip';
  document.body.appendChild(tip);
  function bindTooltip(el) {
    el.addEventListener('mouseover', function(e) {
      var t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) return;
      tip.textContent = t.getAttribute('data-tip');
      tip.style.opacity = '1';
    });
    el.addEventListener('mousemove', function(e) {
      tip.style.left = (e.clientX + 14) + 'px';
      tip.style.top  = (e.clientY - 36) + 'px';
    });
    el.addEventListener('mouseout', function(e) {
      var t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) return;
      // Ignore les mouseout internes (ex: on quitte le <span> mais on reste dans l'item)
      if (t.contains(e.relatedTarget)) return;
      tip.style.opacity = '0';
    });
    el.addEventListener('mouseleave', function() { tip.style.opacity = '0'; });
  }
  bindTooltip(instance.data.calGrid);
  bindTooltip(instance.data.calHdr);

  /* ── Changement d'année : custom state + event Bubble (pour borner la recherche serveur),
     jamais lu en retour par le plugin → pas de risque de boucle cyclique. ── */
  instance.data.changeYear = function(newYear) {
    if (newYear < MIN_YEAR) return;
    instance.data.selectedYear = newYear;
    instance.data.hasScrolledToToday = false;
    var y = newYear;
    var anchor = (y === HARD_START_YEAR) ? new Date(HARD_START_YEAR, HARD_START_MONTH, 1) : new Date(y, 0, 1);
    instance.data.isUpdating = true;
    instance.publishState('date_selected', anchor);
    instance.triggerEvent('date_changed');
    instance.data.isUpdating = false;
    instance.data.reRender();
    instance.data.rightPnl.scrollLeft = 0;
  };

  /* ── Bouton Aujourd'hui ──────────────────────────────────────────── */
  instance.data.todayBtn.addEventListener('click', function() {
    var currentYear = new Date().getFullYear();
    if (instance.data.selectedYear !== currentYear) {
      instance.data.selectedYear = currentYear;
      instance.data.hasScrolledToToday = false;
      instance.data.isUpdating = true;
      instance.publishState('date_selected', new Date());
      instance.triggerEvent('date_changed');
      instance.data.isUpdating = false;
      instance.data.reRender();
    }
    instance.data.rightPnl.scrollLeft = instance.data.todayScrollX || 0;
  });

  /* ── Flèches navigation année ─────────────────────────────────────── */
  instance.data.yrPrevBtn.addEventListener('click', function() {
    instance.data.changeYear(instance.data.selectedYear - 1);
  });
  instance.data.yrNextBtn.addEventListener('click', function() {
    instance.data.changeYear(instance.data.selectedYear + 1);
  });

  /* ── Toggle week-ends ────────────────────────────────────────────── */
  instance.data.weBtn.addEventListener('click', function() {
    instance.data.showWeekends = !instance.data.showWeekends;
    instance.data.weBtn.textContent = instance.data.showWeekends ? '7j' : '5j';
    instance.data.weBtn.classList.toggle('active', !instance.data.showWeekends);
    instance.data.reRender();
  });

  /* ── Toggle graphique de charge ────────────────────────────────────── */
  instance.data.chartBtn.addEventListener('click', function() {
    instance.data.showChart = !instance.data.showChart;
    instance.data.chartBtn.classList.toggle('active', instance.data.showChart);
    instance.data.reRender();
  });

  /* ── Sélection visuelle d'une ligne (liste gauche) — ne déclenche rien côté Bubble ── */
  instance.data.selectRow = function(idx) {
    instance.data.projList.querySelectorAll('.pr').forEach(function(r) { r.classList.remove('sel'); });
    instance.data.calGrid.querySelectorAll('.cg-row').forEach(function(r) { r.classList.remove('sel'); });
    var pRows = instance.data.projList.querySelectorAll('.pr');
    var gRows = instance.data.calGrid.querySelectorAll('.cg-row');
    if (pRows[idx]) pRows[idx].classList.add('sel');
    if (gRows[idx]) gRows[idx].classList.add('sel');
    instance.data.selectedIdx = idx;
  };

  /* ── Activation d'une ligne : partagée entre le clic sur un item de la grille et le
     bouton "sélectionner" de la liste gauche.
     - chantier "parent" (regroupement) → toggle déplier/replier.
     - chantier "feuille" (enfant, ou parent sans enfant) → sélection réelle, publiée à Bubble. ── */
  instance.data.activateRow = function(idx) {
    var list = instance.data.rowsList;
    if (!list || !list[idx]) return;
    var rowData = list[idx];

    if (rowData.type === 'parent' && rowData.ch.hasChild) {
      instance.data.expanded[rowData.ch.id] = !instance.data.expanded[rowData.ch.id];
      instance.data.reRender();
      return;
    }

    instance.data.selectRow(idx);

    var chObj = rowData.ch;
    if (chObj.raw) {
      instance.data.isUpdating = true;
      instance.publishState('selected_chantier', chObj.raw);
      instance.triggerEvent('chantier_selectionne');
      instance.data.isUpdating = false;
    } else {
      // Rendu depuis le cache : pas encore de vrai objet Bubble → on mémorise l'id,
      // update.js le résoudra dès que les vraies données seront arrivées.
      instance.data.pendingSelectId = chObj.id;
    }
  };

  /* ── Clic dans la liste gauche ────────────────────────────────────────
     - chevron → toggle déplier/replier direct.
     - bouton "›" → activation réelle (voir activateRow ci-dessus).
     - reste de la ligne (nom...) → simple surbrillance, aucun event Bubble. ── */
  instance.data.projList.addEventListener('click', function(e) {
    var chv = e.target.closest ? e.target.closest('.chv') : null;
    if (chv) {
      var pid = chv.getAttribute('data-pid');
      instance.data.expanded[pid] = !instance.data.expanded[pid];
      instance.data.reRender();
      return;
    }

    var btn = e.target.closest ? e.target.closest('.sel-btn') : null;
    if (btn) {
      var bidx = parseInt(btn.getAttribute('data-idx'), 10);
      if (!isNaN(bidx)) { instance.data.activateRow(bidx); }
      return;
    }

    var gbtn = e.target.closest ? e.target.closest('.goto-btn') : null;
    if (gbtn) {
      var gidx = parseInt(gbtn.getAttribute('data-idx'), 10);
      var glist = instance.data.rowsList;
      if (glist && !isNaN(gidx) && glist[gidx] && glist[gidx].scrollX != null) {
        instance.data.rightPnl.scrollLeft = Math.max(0, glist[gidx].scrollX - 40);
      }
      return;
    }

    var row = e.target.closest ? e.target.closest('.pr') : null;
    if (!row) return;
    var idx = parseInt(row.getAttribute('data-idx'), 10);
    var list = instance.data.rowsList;
    if (!list || isNaN(idx) || idx < 0 || idx >= list.length) return;
    instance.data.selectRow(idx);
  });

  /* ── Survol liste gauche → surbrillance de la ligne correspondante dans la grille ── */
  instance.data.projList.addEventListener('mouseover', function(e) {
    var row = e.target.closest ? e.target.closest('.pr') : null;
    if (!row || !instance.data.rowHlEl) return;
    var idx = parseInt(row.getAttribute('data-idx'), 10);
    if (isNaN(idx) || !instance.data.rowTops) return;
    instance.data.rowHlEl.style.top     = instance.data.rowTops[idx] + 'px';
    instance.data.rowHlEl.style.height  = instance.data.rowHeights[idx] + 'px';
    instance.data.rowHlEl.style.display = 'block';
  });
  instance.data.projList.addEventListener('mouseleave', function() {
    if (instance.data.rowHlEl) { instance.data.rowHlEl.style.display = 'none'; }
  });

  /* ── Clic sur un item de la grille → activation (voir activateRow ci-dessus) ── */
  instance.data.calGrid.addEventListener('click', function(e) {
    var el = e.target.closest ? e.target.closest('.item') : null;
    if (!el) return;
    var idx = parseInt(el.getAttribute('data-ridx'), 10);
    instance.data.activateRow(idx);
  });

  /* ── Highlight colonne au survol du planning ──────────────────────── */
  instance.data.updateColHl = function(clientX) {
    var dayX = instance.data._dayX, dayW = instance.data._dayW, el = instance.data.colHlEl;
    if (!dayX || !el) return;
    var rect = instance.data.calGrid.getBoundingClientRect();
    var localX = clientX - rect.left;
    for (var i = 0; i < dayX.length; i++) {
      if (localX >= dayX[i] && localX < dayX[i] + dayW[i]) {
        el.style.left    = dayX[i] + 'px';
        el.style.width   = dayW[i] + 'px';
        el.style.display = 'block';
        return;
      }
    }
    el.style.display = 'none';
  };
  instance.data.calGrid.addEventListener('mousemove', function(e) {
    instance.data.lastMouseX = e.clientX;
    instance.data.updateColHl(e.clientX);
  });
  instance.data.calGrid.addEventListener('mouseleave', function() {
    instance.data.lastMouseX = null;
    if (instance.data.colHlEl) instance.data.colHlEl.style.display = 'none';
  });

  /* ── Nom des items "épinglé" au scroll horizontal : quand le bord gauche de l'item
     sort de la zone visible, le libellé reste collé au bord visible (comme repoussé
     par un mur) tant qu'une partie de l'item est encore affichée. ── */
  instance.data.updatePinnedLabels = function() {
    var scrollLeft = instance.data.rightPnl.scrollLeft;
    instance.data.calGrid.querySelectorAll('.item').forEach(function(el) {
      var left  = parseFloat(el.getAttribute('data-left'));
      var width = parseFloat(el.getAttribute('data-width'));
      var lbl   = el.firstElementChild;
      if (!lbl) return;
      var maxTx = Math.max(0, width - 20); // garde toujours un peu de libellé visible
      var tx    = Math.min(Math.max(0, scrollLeft - left), maxTx);
      lbl.style.transform = tx ? 'translateX(' + tx + 'px)' : '';
    });
  };

  /* ── Synchronisation scroll vertical gauche ↔ droite (+ highlight colonne + lazy loading) ── */
  instance.data.rightPnl.addEventListener('scroll', function() {
    instance.data.projList.scrollTop = this.scrollTop;
    if (instance.data.lastMouseX != null) { instance.data.updateColHl(instance.data.lastMouseX); }
    instance.data.updatePinnedLabels();
  });
  // La liste gauche n'a pas son propre scroll (overflow-y:hidden, pilotée par la grille) —
  // on relaie la molette pour que ça reste utilisable même quand la souris est dessus.
  instance.data.projList.addEventListener('wheel', function(e) {
    e.preventDefault();
    instance.data.rightPnl.scrollTop += e.deltaY;
  }, { passive: false });

  /* ── Drag pour naviguer (clic maintenu + déplacement, hors item/bouton) ──
     Un seuil de quelques pixels distingue un simple clic (sélection, highlight)
     d'un vrai drag, pour ne pas casser les interactions existantes. ── */
  (function() {
    var DRAG_THRESHOLD = 4;
    var pan = null; // { startX, startY, scrollLeft, scrollTop, moved }
    instance.data.rightPnl.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      var t = e.target;
      if (t.closest && t.closest('.item, button, input')) return;
      pan = {
        startX: e.clientX, startY: e.clientY,
        scrollLeft: instance.data.rightPnl.scrollLeft,
        scrollTop:  instance.data.rightPnl.scrollTop,
        moved: false,
      };
    });
    window.addEventListener('mousemove', function(e) {
      if (!pan) return;
      var dx = e.clientX - pan.startX;
      var dy = e.clientY - pan.startY;
      if (!pan.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        pan.moved = true;
        document.body.style.userSelect = 'none';
      }
      instance.data.rightPnl.scrollLeft = pan.scrollLeft - dx;
      instance.data.rightPnl.scrollTop  = pan.scrollTop - dy;
      e.preventDefault();
    });
    window.addEventListener('mouseup', function() {
      if (pan && pan.moved) { document.body.style.userSelect = ''; }
      pan = null;
    });
  })();

  /* ── Filtre recherche textuelle ─────────────────────────────────────
     Le filtrage se fait dans renderPlanning (sur instance.data.searchQuery),
     pas ici en CSS après-coup — sinon liste et grille se désynchronisent. ── */
  instance.data.searchQuery = '';
  instance.data.srchInp.addEventListener('input', function() {
    instance.data.searchQuery = instance.data.srchInp.value;
    instance.data.clearBtn.style.display = instance.data.searchQuery ? 'block' : 'none';
    instance.data.reRender();
  });
  instance.data.clearBtn.addEventListener('click', function() {
    instance.data.srchInp.value = '';
    instance.data.searchQuery = '';
    instance.data.clearBtn.style.display = 'none';
    instance.data.srchInp.focus();
    instance.data.reRender();
  });

  instance.data.setCanvasHeight = function() {
    var rect = instance.canvas[0].getBoundingClientRect();
    if (rect.top === 0 && rect.height === 0) return;
    var h = Math.floor(window.innerHeight - rect.top - 16);
    if (h > 100) { instance.canvas[0].style.height = h + 'px'; }
  };
  window.addEventListener('resize', instance.data.setCanvasHeight);

  /* ── Rendu instantané depuis le cache (avant même que Bubble ait répondu) ── */
  var cached = instance.data.loadCache();
  if (cached && cached.chantiers) {
    var cChantiersAll = cached.chantiers.map(function(c) {
      return {
        id: c.id, nom: c.nom, parentId: c.parentId, hasChild: c.hasChild,
        periods: c.periods.map(function(p) { return { deb: new Date(p.deb), fin: new Date(p.fin) }; }),
        raw: null,
      };
    });
    var cChildrenMap = {};
    cChantiersAll.forEach(function(c) {
      if (c.parentId) {
        if (!cChildrenMap[c.parentId]) cChildrenMap[c.parentId] = [];
        cChildrenMap[c.parentId].push(c);
      }
    });
    var cChantiers = cChantiersAll.filter(function(c) { return !c.parentId; });
    var cChefDates = (cached.chefDates || []).map(function(cd) {
      return { chantierId: cd.chantierId, deb: new Date(cd.deb), fin: new Date(cd.fin), duree: cd.duree, chefName: cd.chefName, chefColor: cd.chefColor };
    });
    var cOffSet = {};
    (cached.joursOff || []).forEach(function(ts) { cOffSet[new Date(ts).toDateString()] = true; });
    var cCfg = cached.config || {};
    // On repart systématiquement sur l'année en cours à chaque chargement (selectedYear
    // reste null ici, il sera seedé au premier appel de renderPlanning).
    instance.data.renderPlanning(cChantiersAll, cChildrenMap, cChantiers, cChefDates, cOffSet, {
      maxCh:        cCfg.maxCh        || 15,
      couleurNormal: cCfg.couleurNormal || '#4ade80',
      couleurAlerte: cCfg.couleurAlerte || '#f97316',
      couleurDanger: cCfg.couleurDanger || '#dc2626',
      couleurLimite: cCfg.couleurLimite || '#dc2626',
      seuilAlerte:  cCfg.seuilAlerte  || Math.round((cCfg.maxCh || 15) * 0.75),
      chartH:       cCfg.chartH       != null ? cCfg.chartH : 120,
    });
  }

  instance.data.initialized = true;
}