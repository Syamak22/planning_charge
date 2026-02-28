function(instance, properties) {
  var $c = $(instance.canvas);
  $c.empty();

  /* ── CONFIG ─────────────────────────────────────────────────────── */
  var CW  = 26, CWE = 16, CH = 22, CG = 2, WS = 5;
  //          ^ jour ouvré  ^ samedi/dimanche (plus étroit)
  var LW = 296, RH = 30;
  var MOIS  = ['Janv','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];
  var JOURS = ['Di','Lun','Mar','Mer','Jeu','Ven','Sa'];  // index = getDay()

  /* ── DONNÉES EXEMPLE ─────────────────────────────────────────────── */
  // workIdx 0 = Lun 23 Fév  |  workIdx 3 = Jeu 26 Fév (aujourd'hui)
  var chantiers = [
    {n:'Palaia Construction — Sci Apache',           c:'#e91e8c', f:3,  t:4  },
    {n:'S.A.S MLS — Charpente couverture terrasse',  c:'#e91e8c', f:3,  t:16 },
    {n:'Mairie de Grimaud — Moulin St Roch',         c:'#d32f2f', f:3,  t:34 },
    {n:'Scp Le Sablier — Maison en chêne',           c:'#f5c400', f:3,  t:34 },
    {n:'Mairie du Muy — Maison de la jeunesse',      c:'#e91e8c', f:7,  t:21 },
    {n:'COTIC Benoit — Fourniture et montage',       c:'#e91e8c', f:9,  t:16 },
    {n:'DARMON Jean Claude — Villa Paradis',          c:null },
    {n:'Domaine Les Camelins — Rénovation',           c:null },
    {n:'Mr DE CURIERES — Escalier & Garde-corps',    c:null },
    {n:'GCPM PURIC — Charpente en sous oeuvre',      c:null },
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

  // Positions X de chaque jour (pour calcul largeur des mois)
  var dayX = [], curX = 0;
  weeks.forEach(function(week, wi) {
    week.forEach(function(day, di) {
      dayX.push(curX);
      curX += (day.isWeekend ? CWE : CW) + (di < week.length - 1 ? CG : 0);
    });
    if (wi < weeks.length - 1) curX += WS;
  });

  // Groupes de mois
  var moisSpans = [];
  days.forEach(function(day, idx) {
    var k = day.y + '-' + day.m;
    if (!moisSpans.length || moisSpans[moisSpans.length - 1].k !== k)
      moisSpans.push({ k:k, lbl:MOIS[day.m] + " '" + String(day.y).slice(2), firstIdx:idx, lastIdx:idx });
    moisSpans[moisSpans.length - 1].lastIdx = idx;
  });

  // Compteurs par jour ouvré
  var counts = days.map(function(day) {
    if (day.isWeekend) return 0;
    return chantiers.filter(function(c) {
      return c.c && day.wi >= c.f && day.wi <= c.t;
    }).length;
  });

  /* ── CSS ─────────────────────────────────────────────────────────── */
  var pfx = 'pcv' + Math.random().toString(36).slice(2, 7);
  var q   = '.' + pfx + ' ';

  var css =
    '.' + pfx + '{display:flex;flex-direction:column;width:100%;height:100%;' +
      'font-family:inherit;font-size:13px;color:#1f2937;background:#fff;overflow:hidden;}' +
    q + '*{box-sizing:border-box;}' +

    q + '.tb{display:flex;align-items:center;gap:10px;padding:8px 14px;' +
      'border-bottom:1px solid #e5e7eb;flex-shrink:0;}' +
    q + '.sb{display:flex;align-items:center;gap:7px;background:#f3f4f6;' +
      'border-radius:8px;padding:5px 11px;flex:1;max-width:268px;}' +
    q + '.sb input{border:none;background:none;outline:none;font-size:12px;color:#374151;width:100%;}' +
    q + '.tot{font-size:12px;color:#6b7280;}' +
    q + '.sf{display:flex;align-items:center;gap:6px;background:#f3f4f6;border-radius:8px;padding:5px 11px;margin-left:auto;}' +
    q + '.sf select{border:none;background:none;outline:none;font-size:12px;color:#374151;cursor:pointer;font-family:inherit;}' +

    q + '.bd{display:flex;flex:1;overflow:hidden;}' +

    /* panneau gauche */
    q + '.lp{width:' + LW + 'px;flex-shrink:0;display:flex;flex-direction:column;' +
      'border-right:2px solid #e5e7eb;background:#fff;z-index:3;}' +
    q + '.lh{height:72px;flex-shrink:0;border-bottom:2px solid #e5e7eb;}' +
    q + '.pl{overflow-y:auto;flex:1;}' +
    q + '.pr{display:flex;align-items:center;height:' + RH + 'px;' +
      'padding:0 12px 0 10px;border-bottom:1px solid #f3f4f6;font-size:11.5px;color:#374151;}' +
    q + '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +

    /* panneau droit */
    q + '.rp{flex:1;overflow:auto;}' +
    q + '.rp::-webkit-scrollbar{height:4px;}' +
    q + '.rp::-webkit-scrollbar-track{background:#f1f1f1;}' +
    q + '.rp::-webkit-scrollbar-thumb{background:#e91e8c;border-radius:2px;}' +
    q + '.hd{position:sticky;top:0;background:#fff;z-index:2;' +
      'border-bottom:2px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.07);}' +

    /* rangée des mois */
    q + '.mr{display:flex;padding:4px 0 0;}' +
    q + '.ms{display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;' +
      'font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.07em;padding:0 4px;}' +
    q + '.ms + .ms{border-left:1px solid #e5e7eb;}' +

    /* semaines */
    q + '.wr{display:flex;}' +
    q + '.wg{display:flex;gap:' + CG + 'px;flex-shrink:0;}' +
    q + '.wx{width:' + WS + 'px;flex-shrink:0;border-left:1px solid #e9eaec;}' +

    /* jour ouvré */
    q + '.dc{width:' + CW + 'px;flex-shrink:0;text-align:center;}' +
    q + '.dn{font-size:9.5px;color:#9ca3af;line-height:1.4;}' +
    q + '.dd{font-size:11.5px;font-weight:600;color:#374151;line-height:1.6;}' +
    q + '.dd.today{display:inline-flex;align-items:center;justify-content:center;' +
      'width:20px;height:20px;background:#e91e8c;color:#fff;border-radius:4px;line-height:1;}' +

    /* week-end */
    q + '.we{width:' + CWE + 'px;flex-shrink:0;text-align:center;background:#f5f6f8;border-radius:3px;}' +
    q + '.we .dn{font-size:8.5px;color:#bbbdc4;line-height:1.4;}' +
    q + '.we .dd{font-size:10px;font-weight:500;color:#c0c2c9;line-height:1.6;}' +

    /* compteurs */
    q + '.cr{display:flex;background:#fafafa;padding:3px 0 2px;border-top:1px solid #eeeff1;}' +
    q + '.cc{flex-shrink:0;text-align:center;font-size:9px;font-weight:700;line-height:1;}' +

    /* grille */
    q + '.gr{display:flex;align-items:center;height:' + RH + 'px;border-bottom:1px solid #f3f4f6;padding:4px 0;}' +
    q + '.tl{flex-shrink:0;height:' + CH + 'px;border-radius:5px;}' +
    q + '.tl.we-tile{border-radius:3px;opacity:.5;}';

  /* ── HELPER ──────────────────────────────────────────────────────── */
  function parSemaine(fnJour) {
    return weeks.map(function(sem, si) {
      var cells = sem.map(fnJour).join('');
      var sep   = si < weeks.length - 1 ? '<div class="wx"></div>' : '';
      return '<div class="wg">' + cells + '</div>' + sep;
    }).join('');
  }

  /* ── CONSTRUCTION HTML ───────────────────────────────────────────── */

  // Mois (largeur précise via dayX)
  var mHtml = moisSpans.map(function(ms) {
    var last   = days[ms.lastIdx];
    var w      = dayX[ms.lastIdx] + (last.isWeekend ? CWE : CW) - dayX[ms.firstIdx];
    return '<div class="ms" style="width:' + w + 'px">' + ms.lbl + '</div>';
  }).join('');

  // Noms des jours
  var nomsHtml = parSemaine(function(j) {
    var cls = j.isWeekend ? 'we' : 'dc';
    return '<div class="' + cls + '"><div class="dn">' + j.n + '</div></div>';
  });

  // Numéros des jours
  var numsHtml = parSemaine(function(j) {
    if (j.isWeekend) return '<div class="we"><div class="dd">' + j.num + '</div></div>';
    var cl = j.isToday ? 'dd today' : 'dd';
    return '<div class="dc"><div class="' + cl + '">' + j.num + '</div></div>';
  });


  // Grille
  var gridHtml = chantiers.map(function(ch) {
    var cells = parSemaine(function(j) {
      if (j.isWeekend) {
        return '<div class="tl we-tile" style="width:' + CWE + 'px;background:#e8eaed"></div>';
      }
      var on = ch.c && j.wi >= ch.f && j.wi <= ch.t;
      return '<div class="tl" style="width:' + CW + 'px;background:' + (on ? ch.c : '#e5e7eb') + '"></div>';
    });
    return '<div class="gr">' + cells + '</div>';
  }).join('');

  // Projets
  var projHtml = chantiers.map(function(ch) {
    return '<div class="pr"><div class="pn">' + ch.n + '</div></div>';
  }).join('');

  /* ── RENDER ───────────────────────────────────────────────────────── */

  // Compteurs
  var cntHtml = parSemaine(function(j) {
    var w = j.isWeekend ? CWE : CW;
    if (j.isWeekend) return '<div class="cc" style="width:' + w + 'px"></div>';
    var n   = counts[j.wi >= 0 ? days.findIndex(function(dd){ return dd === j; }) : 0] || 0;
    // fallback propre via workIdx
    n = chantiers.filter(function(c){ return c.c && j.wi >= c.f && j.wi <= c.t; }).length;
    var col = n >= 10 ? '#d32f2f' : n >= 1 ? '#e91e8c' : '#d1d5db';
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
          '<input type="text" placeholder="nom chantier, nom client…" disabled>' +
        '</div>' +
        '<span class="tot">Total : 76</span>' +
        '<div class="sf">' +
          '<svg width="12" height="12" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">' +
            '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>' +
          '</svg>' +
          '<select disabled>' +
            '<option>Tous les statuts</option>' +
            '<option selected>En cours</option>' +
            '<option>Terminé</option>' +
            '<option>En attente</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="bd">' +
        '<div class="lp">' +
          '<div class="lh"></div>' +
          '<div class="pl">' + projHtml + '</div>' +
        '</div>' +
        '<div class="rp">' +
          '<div class="hd">' +
            '<div class="mr">' + mHtml    + '</div>' +
            '<div class="wr">' + nomsHtml + '</div>' +
            '<div class="wr">' + numsHtml + '</div>' +
            '<div class="cr">' + cntHtml  + '</div>' +
          '</div>' +
          gridHtml +
        '</div>' +
      '</div>' +
    '</div>'
  );
}
