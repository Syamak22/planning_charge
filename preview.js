function(instance, properties) {
  var $c = $(instance.canvas);
  $c.empty();

  /* ── CONFIG ─────────────────────────────────────────────────────── */
  var CW  = 22, CWE = 22, CG = 3, WS = 8, RH = 30;
  var MOIS  = ['Janv','Fev','Mars','Avril','Mai','Juin','Juillet','Aout','Sept','Oct','Nov','Dec'];
  var JOURS = ['Di','Lun','Mar','Mer','Jeu','Ven','Sa'];  // index = getDay()

  /* ── DONNÉES EXEMPLE (avec hiérarchie parent/enfant) ─────────────── */
  // workIdx 0 = Lun 23 Fév  |  workIdx 3 = Jeu 26 Fév (aujourd'hui)
  var chantiers = [
    { n:'Palaia Construction — Sci Apache',          c:'#e91e8c', f:3,  t:4,
      kids: [] },
    { n:'S.A.S MLS — Charpente couverture terrasse', c:'#e91e8c', f:3,  t:16,
      kids: [
        { n:'Lot charpente', c:'#e91e8c', f:3,  t:9  },
        { n:'Lot couverture', c:'#e91e8c', f:9,  t:16 },
      ] },
    { n:'Mairie de Grimaud — Moulin St Roch',        c:'#d32f2f', f:3,  t:34, kids: [] },
    { n:'Scp Le Sablier — Maison en chêne',          c:'#f5c400', f:3,  t:34, kids: [] },
    { n:'Mairie du Muy — Maison de la jeunesse',     c:'#e91e8c', f:7,  t:21, kids: [] },
    { n:'COTIC Benoit — Fourniture et montage',      c:'#e91e8c', f:9,  t:16, kids: [] },
    { n:'DARMON Jean Claude — Villa Paradis',         c:null, kids: [] },
    { n:'Domaine Les Camelins — Rénovation',          c:null, kids: [] },
    { n:'Mr DE CURIERES — Escalier & Garde-corps',   c:null, kids: [] },
    { n:'GCPM PURIC — Charpente en sous oeuvre',     c:null, kids: [] },
  ];

  /* ── GÉNÉRATION DES JOURS (6 semaines complètes Lun–Dim) ─────────── */
  var todayDate  = new Date(2026, 1, 26);         // Jeu 26 Fév 2026
  var startDate  = new Date(2026, 1, 23);         // Lun 23 Fév (début de semaine)
  var days = [], workIdx = 0;

  for (var i = 0; i < 6 * 7; i++) {
    var d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    var dow       = d.getDay();
    var isWeekend = (dow === 0 || dow === 6);
    var isToday   = (d.toDateString() === todayDate.toDateString());
    days.push({
      d: d, wi: isWeekend ? -1 : workIdx,
      n: JOURS[dow], num: d.getDate(),
      m: d.getMonth(), y: d.getFullYear(),
      isWeekend: isWeekend, isToday: isToday
    });
    if (!isWeekend) workIdx++;
  }

  // Groupes de semaines (Lun = début)
  var weeks = [];
  days.forEach(function(day) {
    if (day.d.getDay() === 1 || !weeks.length) weeks.push([]);
    weeks[weeks.length - 1].push(day);
  });

  // Positions X + largeurs de chaque jour
  var dayX = [], dayW = [], curX = 0;
  weeks.forEach(function(week, wi) {
    week.forEach(function(day, di) {
      var w = day.isWeekend ? CWE : CW;
      dayX.push(curX);
      dayW.push(w);
      curX += w + (di < week.length - 1 ? CG : 0);
    });
    if (wi < weeks.length - 1) curX += WS;
  });
  var totalW = curX;

  // Groupes de mois
  var moisSpans = [];
  days.forEach(function(day, idx) {
    var k = day.y + '-' + day.m;
    if (!moisSpans.length || moisSpans[moisSpans.length - 1].k !== k)
      moisSpans.push({ k:k, lbl:MOIS[day.m] + ' ' + String(day.y).slice(2), firstIdx:idx, lastIdx:idx });
    moisSpans[moisSpans.length - 1].lastIdx = idx;
  });

  /* ── Lignes affichées (parents + enfants, tous dépliés dans la preview) ── */
  var rows = [];
  chantiers.forEach(function(ch) {
    rows.push({ type: 'parent', ch: ch, hasKids: !!(ch.kids && ch.kids.length) });
    (ch.kids || []).forEach(function(k) { rows.push({ type: 'child', ch: k }); });
  });

  // Compteurs par jour ouvré (chantiers de premier niveau uniquement)
  var counts = days.map(function(day) {
    if (day.isWeekend) return 0;
    return chantiers.filter(function(c) { return c.c && day.wi >= c.f && day.wi <= c.t; }).length;
  });

  /* ── CSS ─────────────────────────────────────────────────────────── */
  var pfx = 'pcv' + Math.random().toString(36).slice(2, 7);
  var q   = '.' + pfx + ' ';

  var css =
    '.' + pfx + '{display:flex;flex-direction:column;width:100%;height:100%;' +
      'font-family:inherit;font-size:13px;color:#1e293b;background:#fff;overflow:hidden;}' +
    q + '*{box-sizing:border-box;}' +

    q + '.tb{display:flex;align-items:center;gap:10px;padding:8px 14px;' +
      'border-bottom:1px solid #e2e8f0;flex-shrink:0;}' +
    q + '.sb{display:flex;align-items:center;gap:7px;background:#f1f5f9;' +
      'border-radius:8px;padding:5px 11px;flex:1;max-width:268px;}' +
    q + '.sb input{border:none;background:none;outline:none;font-size:12px;color:#374151;width:100%;}' +
    q + '.tot{font-size:12px;color:#64748b;}' +
    q + '.aj{font-size:11px;font-weight:600;color:#64748b;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:3px 8px;line-height:1.4;white-space:nowrap;font-family:inherit;}' +
    q + '.we{font-size:11px;font-weight:600;color:#64748b;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:3px 8px;line-height:1.4;white-space:nowrap;font-family:inherit;}' +
    q + '.sf{display:flex;align-items:center;gap:6px;background:#f1f5f9;border-radius:8px;padding:5px 11px;margin-left:auto;}' +
    q + '.sf select{border:none;background:none;outline:none;font-size:12px;color:#374151;cursor:pointer;font-family:inherit;}' +

    q + '.bd{display:flex;flex:1;overflow:hidden;}' +

    /* panneau gauche */
    q + '.lp{width:296px;flex-shrink:0;display:flex;flex-direction:column;' +
      'border-right:2px solid #e2e8f0;background:#fff;z-index:3;}' +
    q + '.lh{height:132px;flex-shrink:0;border-bottom:2px solid #e2e8f0;}' +
    q + '.pl{overflow-y:auto;flex:1;}' +
    q + '.pr{display:flex;align-items:center;height:' + RH + 'px;gap:5px;' +
      'padding:0 12px 0 10px;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#374151;}' +
    q + '.pr.child{padding-left:26px;}' +
    q + '.pr.child .pn{color:#64748b;font-weight:400;}' +
    q + '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    q + '.chv{width:14px;flex-shrink:0;text-align:center;color:#94a3b8;font-size:9px;}' +
    q + '.chv-ph{width:14px;flex-shrink:0;}' +

    /* panneau droit */
    q + '.rp{flex:1;overflow:auto;}' +
    q + '.rp::-webkit-scrollbar{height:4px;}' +
    q + '.rp::-webkit-scrollbar-track{background:#f1f1f1;}' +
    q + '.rp::-webkit-scrollbar-thumb{background:#e91e8c;border-radius:2px;}' +
    q + '.hd{position:sticky;top:0;background:#fff;z-index:2;' +
      'border-bottom:2px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.07);}' +

    /* rangée des mois */
    q + '.mr{display:flex;padding:4px 0 0;}' +
    q + '.ms{display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;' +
      'font-size:11px;font-weight:700;color:#111827;padding:0 4px;}' +
    q + '.ms + .ms{border-left:2px solid #6b7280;}' +

    /* semaines */
    q + '.wr{display:flex;}' +
    q + '.wg{display:flex;gap:' + CG + 'px;flex-shrink:0;}' +
    q + '.wx{width:' + WS + 'px;flex-shrink:0;border-left:1px solid #e9eaec;}' +

    /* jour ouvré */
    q + '.dc{width:' + CW + 'px;flex-shrink:0;text-align:center;}' +
    q + '.dn{font-size:9.5px;color:#94a3b8;line-height:1.4;}' +
    q + '.dd{font-size:11.5px;font-weight:600;color:#374151;line-height:1.6;}' +
    q + '.dd.today{display:inline-flex;align-items:center;justify-content:center;' +
      'width:20px;height:20px;background:#e91e8c;color:#fff;border-radius:4px;line-height:1;}' +

    /* week-end */
    q + '.wke{width:' + CWE + 'px;flex-shrink:0;text-align:center;background:#f1f5f9;border-radius:3px;}' +
    q + '.wke .dn{font-size:8.5px;color:#bbbdc4;line-height:1.4;}' +
    q + '.wke .dd{font-size:10px;font-weight:500;color:#c0c2c9;line-height:1.6;}' +

    /* compteurs */
    q + '.cr{display:flex;background:#fafafa;padding:3px 0 2px;border-top:1px solid #eeeff1;}' +
    q + '.cc{flex-shrink:0;text-align:center;font-size:9px;font-weight:700;line-height:1;}' +

    /* grille (barres façon Gantt) */
    q + '.cg{position:relative;}' +
    q + '.cg-bg{position:absolute;top:0;bottom:0;pointer-events:none;background:#f1f5f9;}' +
    q + '.cg-row{position:absolute;left:0;right:0;height:' + RH + 'px;border-bottom:1px solid #f1f5f9;}' +
    q + '.item{position:absolute;top:4px;height:22px;border-radius:5px;overflow:hidden;display:flex;align-items:center;padding:0 6px;box-sizing:border-box;}' +
    q + '.item span{font-size:10px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    q + '.item.child{opacity:.85;top:5px;height:20px;}';

  /* ── HELPER ──────────────────────────────────────────────────────── */
  function parSemaine(fnJour) {
    return weeks.map(function(sem, si) {
      var cells = sem.map(fnJour).join('');
      var sep   = si < weeks.length - 1 ? '<div class="wx"></div>' : '';
      return '<div class="wg">' + cells + '</div>' + sep;
    }).join('');
  }
  function bgTint(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex + '22' : 'rgba(148,163,184,0.15)';
  }

  /* ── CONSTRUCTION HTML ───────────────────────────────────────────── */

  // Noms des jours
  var nomsHtml = parSemaine(function(j) {
    var cls = j.isWeekend ? 'wke' : 'dc';
    return '<div class="' + cls + '"><div class="dn">' + j.n + '</div></div>';
  });

  // Numéros des jours
  var numsHtml = parSemaine(function(j) {
    if (j.isWeekend) return '<div class="wke"><div class="dd">' + j.num + '</div></div>';
    var cl = j.isToday ? 'dd today' : 'dd';
    return '<div class="dc"><div class="' + cl + '">' + j.num + '</div></div>';
  });

  // Projets (panneau gauche, avec hiérarchie)
  var projHtml = rows.map(function(row) {
    var chv = row.type === 'parent'
      ? (row.hasKids ? '<span class="chv">▾</span>' : '<span class="chv-ph"></span>')
      : '<span class="chv-ph"></span>';
    return '<div class="pr' + (row.type === 'child' ? ' child' : '') + '">' + chv + '<div class="pn">' + row.ch.n + '</div></div>';
  }).join('');

  // Fond de colonnes week-end
  var bgHtml = '';
  days.forEach(function(day, di) {
    if (day.isWeekend) bgHtml += '<div class="cg-bg" style="left:' + dayX[di] + 'px;width:' + dayW[di] + 'px;"></div>';
  });

  // Grille — une barre par chantier (parent ou enfant), positionnée sur sa période
  var totalH = rows.length * RH;
  var rowsHtml = rows.map(function(row, ri) {
    var ch = row.ch;
    var bar = '';
    if (ch.c) {
      var left  = dayX[days.findIndex(function(d) { return d.wi === ch.f; })];
      var endDi = days.findIndex(function(d) { return d.wi === ch.t; });
      var width = (dayX[endDi] + dayW[endDi]) - left - 2;
      bar = '<div class="item' + (row.type === 'child' ? ' child' : '') + '" style="left:' + (left + 1) + 'px;width:' + width + 'px;background:' + bgTint(ch.c) + ';border:1.5px solid ' + ch.c + ';">' +
              '<span>' + ch.n + '</span>' +
            '</div>';
    }
    return '<div class="cg-row" style="top:' + (ri * RH) + 'px;">' + bar + '</div>';
  }).join('');

  /* ── GRAPHIQUE DE CHARGE — barres par jour ──────────────────────── */
  var MAX_CH_PV  = 10;
  var CHART_H_PV = 80;
  var COL_NORMAL = '#4ade80';
  var COL_ALERTE = '#f97316';
  var COL_DANGER = '#dc2626';
  var COL_LIMITE = '#dc2626';
  var SEUIL_PV   = Math.round(MAX_CH_PV * 0.75);

  var pvMaxCount = 0;
  counts.forEach(function(n) { if (n > pvMaxCount) pvMaxCount = n; });
  var pvMaxY = Math.max(MAX_CH_PV, pvMaxCount) * 1.25;
  if (pvMaxY === 0) pvMaxY = 10;

  function pvBarColor(n) {
    if (n >= MAX_CH_PV) return COL_DANGER;
    if (n >= SEUIL_PV)  return COL_ALERTE;
    return COL_NORMAL;
  }

  var pvLineTopPx = Math.round(CHART_H_PV * (1 - MAX_CH_PV / pvMaxY));

  var pvDayMoIdx = [];
  moisSpans.forEach(function(ms, mi) {
    for (var di = ms.firstIdx; di <= ms.lastIdx; di++) pvDayMoIdx[di] = mi;
  });

  var pvMoLabels = moisSpans.map(function(ms) {
    return '<span style="position:absolute;left:' + (dayX[ms.firstIdx] + 4) + 'px;top:4px;' +
           'font-size:12px;font-weight:900;color:#000000;pointer-events:none;z-index:3;white-space:nowrap;">' +
           ms.lbl + '</span>';
  }).join('');

  var pvChartRow = parSemaine(function(j) {
    var w    = j.isWeekend ? CWE : CW;
    var di   = days.indexOf(j);
    var n    = counts[di] || 0;
    var bh   = (!j.isWeekend && n > 0) ? Math.round(CHART_H_PV * n / pvMaxY) : 0;
    var bgMo = (pvDayMoIdx[di] % 2 === 0) ? 'rgba(0,0,0,0.03)' : 'transparent';
    return '<div style="width:' + w + 'px;height:' + CHART_H_PV + 'px;display:flex;align-items:flex-end;justify-content:center;background:' + bgMo + ';">' +
           (bh > 0
             ? '<div style="width:70%;height:' + bh + 'px;background:' + pvBarColor(n) + ';border-radius:2px 2px 0 0;"></div>'
             : '') +
           '</div>';
  });

  var cntHtml = parSemaine(function(j) {
    var w  = j.isWeekend ? CWE : CW;
    if (j.isWeekend) return '<div class="cc" style="width:' + w + 'px"></div>';
    var n   = chantiers.filter(function(c){ return c.c && j.wi >= c.f && j.wi <= c.t; }).length;
    var col = n >= MAX_CH_PV ? '#d32f2f' : n >= 1 ? '#e91e8c' : '#d1d5db';
    return '<div class="cc" style="width:' + w + 'px;color:' + col + '">' + (n || '') + '</div>';
  });

  $c.html(
    '<div class="' + pfx + '" style="height:100%">' +
      '<style>' + css + '</style>' +

      '<div class="tb">' +
        '<div class="sb">' +
          '<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
          '</svg>' +
          '<input type="text" placeholder="nom chantier…" disabled>' +
        '</div>' +
        '<button class="we" disabled>7j</button>' +
        '<button class="aj" disabled>Aujourd\'hui</button>' +
        '<span class="tot">Total : ' + chantiers.length + '</span>' +
      '</div>' +

      '<div class="bd">' +
        '<div class="lp">' +
          '<div class="lh"></div>' +
          '<div class="pl">' + projHtml + '</div>' +
        '</div>' +
        '<div class="rp">' +
          '<div class="hd">' +
            '<div style="position:relative;height:' + CHART_H_PV + 'px;background:#fafafa;border-bottom:1px solid #eeeff1;">' +
              '<div class="wr">' + pvChartRow + '</div>' +
              pvMoLabels +
              '<div style="position:absolute;left:0;right:0;top:' + pvLineTopPx + 'px;height:2px;background:' + COL_LIMITE + ';pointer-events:none;z-index:2;"></div>' +
            '</div>' +
            '<div class="wr">' + nomsHtml + '</div>' +
            '<div class="wr">' + numsHtml + '</div>' +
            '<div class="cr">' + cntHtml  + '</div>' +
          '</div>' +
          '<div class="cg" style="width:' + totalW + 'px;height:' + totalH + 'px;">' + bgHtml + rowsHtml + '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}