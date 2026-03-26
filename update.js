function(instance, properties, context) {

  /* ── Guards ──────────────────────────────────────────────────────── */
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {
    if (!instance.data.initialized) { return; }

    /* ── Helpers ─────────────────────────────────────────────────── */
    function readList(ds) {
      if (!ds) return null;
      if (typeof ds.length === 'function') {
        var len = ds.length();
        return len === 0 ? [] : ds.get(0, len);
      }
      if (typeof ds.length === 'number') {
        return ds.length === 0 ? [] : Array.prototype.slice.call(ds);
      }
      return null;
    }
    function d0(dt) {                        // normalise une date à minuit
      if (!dt) return null;
      var d = new Date(dt); d.setHours(0, 0, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    function osDisplay(item) {               // label d'un item Option Set
      if (!item) return '';
      if (typeof item.get === 'function') return item.get('display') || '';
      return String(item.display != null ? item.display : item);
    }

    /* ── Properties ──────────────────────────────────────────────── */
    // Noms de champs (configurables dans l'éditeur Bubble)
    var champNom    = properties.champ_nom        || 'nom';
    var champChef   = properties.champ_chef       || 'chef';    // champ User sur le chantier
    var champCol    = properties.champ_couleur    || 'couleur'; // champ couleur sur le User
    var champRange  = properties.champ_date_range || 'periode'; // champ date range sur le chantier

    var maxCh        = properties.max_chantiers || 15;
    var couleurNormal = properties.couleur_normal || '#4ade80';
    var couleurAlerte = properties.couleur_alerte || '#f97316';
    var couleurDanger = properties.couleur_danger || '#dc2626';
    var couleurLimite = properties.couleur_limite || '#dc2626';
    var seuilAlerte   = (properties.seuil_alerte != null && properties.seuil_alerte > 0)
                          ? Math.round(properties.seuil_alerte) : Math.round(maxCh * 0.75);
    var semPassees   = (properties.semaines_passees != null && properties.semaines_passees > 0)
                         ? Math.round(properties.semaines_passees) : 26;
    var semFutures   = (properties.semaines_futures != null && properties.semaines_futures > 0)
                         ? Math.round(properties.semaines_futures) : 78;
    var chartH       = (properties.chart_height != null && properties.chart_height >= 0)
                         ? Math.round(properties.chart_height) : 120;
    var today        = d0(new Date());

    /* ── Longueurs uniquement pour le hash (pas de fetch complet) ── */
    function listLen(ds) {
      if (!ds) return null;
      if (typeof ds.length === 'function') return ds.length();
      if (typeof ds.length === 'number')   return ds.length;
      return null;
    }
    var chLen  = listLen(properties.chantiers_list);
    var joLen  = listLen(properties.jours_off_list)      || 0;
    var ctLen  = listLen(properties.chantiers_tout_list) || 0;
    var stLen  = listLen(properties.statuts_list)        || 0;
    var initSt = osDisplay(properties.statut_initial);

    if (chLen === null) { return; }

    /* ── Hash structurel ─────────────────────────────────────────── */
    var hash = [
      today.toDateString(),
      chLen, joLen, ctLen, stLen, initSt,
      maxCh, semPassees, semFutures, chartH,
      couleurNormal, couleurAlerte, couleurDanger, couleurLimite, seuilAlerte,
    ].join('|');

    /* ── Fetch chantiers + fingerprint (avant génération calendrier) ─ */
    var chantiersRaw     = readList(properties.chantiers_list);
    var chantiersToutRaw = readList(properties.chantiers_tout_list);

    function parseChantier(ch, idx) {
      try {
        var nom   = ch.get(champNom) || '(sans nom)';
        var chef  = ch.get(champChef);
        var color = (chef && typeof chef.get === 'function' ? chef.get(champCol) : null) || '#9ca3af';
        var range = ch.get(champRange);
        var periods = [];
        if (range) {
          var deb, fin;
          if (Array.isArray(range) && range.length >= 2) {
            deb = d0(range[0]);
            fin = d0(range[1]);
          } else {
            deb = d0(range.start != null ? range.start : (typeof range.get === 'function' ? range.get('start') : null));
            fin = d0(range.end   != null ? range.end   : (typeof range.get === 'function' ? range.get('end')   : null));
          }
          if (deb && fin) periods.push({ deb: deb, fin: fin });
        }
        return { nom: nom, color: color, periods: periods, raw: ch };
      } catch(e) {
        if (!(e instanceof Error)) throw e;
        console.error('[PC] chantier[' + idx + '] crash:', e.message, '| ch=', ch);
        return { nom: '(erreur)', color: '#9ca3af', periods: [] };
      }
    }
    var chantiers     = chantiersRaw.map(parseChantier);
    var chantiersTout = chantiersToutRaw ? chantiersToutRaw.map(parseChantier) : chantiers;

    /* ── Fingerprint couleurs + périodes ─────────────────────────── */
    var fp = chantiers.map(function(c) {
      return c.color + (c.periods.length ? c.periods[0].deb.getTime() + '-' + c.periods[0].fin.getTime() : '');
    }).join('|');
    if (chantiersTout !== chantiers) {
      fp += '|T:' + chantiersTout.map(function(c) {
        return c.periods.length ? c.periods[0].deb.getTime() + '-' + c.periods[0].fin.getTime() : '';
      }).join('|');
    }

    /* ── Sortie anticipée : avant toute génération calendrier/DOM ── */
    if (instance.data.lastHash === hash && instance.data.lastFp === fp) { return; }

    /* ── Fetch listes restantes (uniquement si re-render nécessaire) ─ */
    var joursOffRaw  = readList(properties.jours_off_list);
    var statutsRaw   = readList(properties.statuts_list);

    /* ── Constantes calendrier ───────────────────────────────────── */
    var CW       = 22;   // largeur cellule jour ouvré (px)
    var CWE      = 22;   // largeur cellule week-end (px)
    var CG       = 3;    // gap inter-cellules (px)
    var WS       = 8;    // séparateur de semaines (px)
    var NUM_WK   = semPassees + semFutures;
    var JOURS    = ['Di', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa'];
    var MOIS     = ['Janv', 'Fev', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Aout', 'Sept', 'Oct', 'Nov', 'Dec'];

    /* ── Jours off (lookup O(1)) ─────────────────────────────────── */
    var offSet = {};
    if (joursOffRaw) {
      joursOffRaw.forEach(function(dt) {
        var nd = d0(dt);
        if (nd) offSet[nd.toDateString()] = true;
      });
    }

    /* ── Génération des jours calendrier ─────────────────────────── */
    var calStart  = new Date(today);
    calStart.setDate(today.getDate() - semPassees * 7);
    var dow0      = calStart.getDay();
    var startDate = new Date(calStart);
    startDate.setDate(calStart.getDate() - (dow0 === 0 ? 6 : dow0 - 1));

    var days = [];
    for (var i = 0; i < NUM_WK * 7; i++) {
      var d   = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      var dow = d.getDay();
      days.push({
        d:         d,
        n:         JOURS[dow],
        num:       d.getDate(),
        m:         d.getMonth(),
        y:         d.getFullYear(),
        isWeekend: (dow === 0 || dow === 6),
        isOff:     !!offSet[d.toDateString()],
        isToday:   (d.toDateString() === today.toDateString()),
      });
    }

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

    // Positions X de chaque jour (pour largeur exacte des mois)
    var dayX = [], curX = 0;
    weeks.forEach(function(wk, wi) {
      wk.forEach(function(day, di) {
        dayX.push(curX);
        curX += (day.isWeekend ? CWE : CW) + (di < wk.length - 1 ? CG : 0);
      });
      if (wi < weeks.length - 1) curX += WS;
    });

    /* ── Matrice d'activité + compteurs ─────────────────────────── */
    var counts = [];
    for (var ci = 0; ci < days.length; ci++) counts.push(0);

    var activeMatrix = chantiers.map(function(ch) {
      var row = [];
      days.forEach(function(day, di) {
        var on = false;
        if (!day.isWeekend && !day.isOff) {
          for (var pi = 0; pi < ch.periods.length; pi++) {
            if (day.d >= ch.periods[pi].deb && day.d <= ch.periods[pi].fin) { on = true; break; }
          }
        }
        if (on) counts[di]++;
        row.push(on);
      });
      return row;
    });

    /* ── Compteurs graphique (tous chantiers, sans filtre statut) ── */
    var allCounts;
    if (chantiersTout === chantiers) {
      allCounts = counts;
    } else {
      allCounts = days.map(function() { return 0; });
      chantiersTout.forEach(function(ch) {
        days.forEach(function(day, di) {
          if (!day.isWeekend && !day.isOff) {
            for (var pi = 0; pi < ch.periods.length; pi++) {
              if (day.d >= ch.periods[pi].deb && day.d <= ch.periods[pi].fin) {
                allCounts[di]++;
                break;
              }
            }
          }
        });
      });
    }

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

    /* ── Échelle Y + couleur des barres ─────────────────────────── */
    var maxAllCount = 0;
    allCounts.forEach(function(n) { if (n > maxAllCount) maxAllCount = n; });
    var maxY = Math.max(maxCh, maxAllCount) * 1.25;
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

    // Compteurs : rouge si >= maxCh, gris sinon
    var cntHtml = byWeek(function(day, di) {
      var w   = day.isWeekend ? CWE : CW;
      var n   = counts[di];
      var col = n >= maxCh ? '#d32f2f' : n > 0 ? '#9ca3af' : '#d9dbe0';
      var txt = n > 0 ? n : '';
      return '<div class="cc" style="width:' + w + 'px;color:' + col + '">' + txt + '</div>';
    });

    /* Rangée graphe par jour (dans le header scrollable) */
    var lineTopPx = Math.round(chartH * (1 - maxCh / maxY));

    // Lookup mois → index pour le fond alterné
    var dayMoIdx = [];
    moisSpans.forEach(function(ms, mi) {
      for (var di = ms.fi; di <= ms.li; di++) dayMoIdx[di] = mi;
    });

    // Labels de mois en overlay dans le graphe
    var moLabels = moisSpans.map(function(ms) {
      return '<span style="position:absolute;left:' + (dayX[ms.fi] + 4) + 'px;top:4px;' +
             'font-size:12px;font-weight:900;color:#000000;pointer-events:none;z-index:3;white-space:nowrap;">' +
             ms.lbl + '</span>';
    }).join('');

    var chartRowHtml =
      '<div class="chg" style="height:' + chartH + 'px">' +
        '<div class="wr">' +
          byWeek(function(day, di) {
            var w    = day.isWeekend ? CWE : CW;
            var n    = allCounts[di];
            var bh   = (!day.isWeekend && !day.isOff && n > 0) ? Math.round(chartH * n / maxY) : 0;
            var bgMo = (dayMoIdx[di] % 2 === 0) ? 'rgba(0,0,0,0.03)' : 'transparent';
            return '<div style="width:' + w + 'px;height:' + chartH + 'px;display:flex;align-items:flex-end;justify-content:center;background:' + bgMo + ';">' +
                   (bh > 0
                     ? '<div style="width:70%;height:' + bh + 'px;background:' + barColor(n) + ';border-radius:2px 2px 0 0;"></div>'
                     : '') +
                   '</div>';
          }) +
        '</div>' +
        moLabels +
        '<div style="position:absolute;left:0;right:0;top:' + lineTopPx + 'px;height:2px;background:' + couleurLimite + ';pointer-events:none;z-index:2;"></div>' +
      '</div>';

    instance.data.calHdr.innerHTML =
      chartRowHtml +
      '<div class="wr">' + nomHtml + '</div>' +
      '<div class="wr">' + numHtml + '</div>' +
      '<div class="cr">' + cntHtml + '</div>';

    /* ── Synchronise hauteur de l'en-tête gauche (immédiatement, avant tout autre DOM) */
    var hdrH = instance.data.calHdr.offsetHeight;
    if (hdrH > 0) instance.data.leftHdr.style.height = hdrH + 'px';

    /* ── Grille ──────────────────────────────────────────────────── */
    var gridHtml = chantiers.map(function(ch, ci) {
      var cells = byWeek(function(day, di) {
        var w  = day.isWeekend ? CWE : CW;
        var on = activeMatrix[ci][di];
        var bg = on            ? ch.color
               : day.isWeekend ? '#e8eaed'
               : day.isOff     ? '#f5d5d5'
               :                 '#e5e7eb';
        return '<div class="tl' + (day.isWeekend ? ' we' : '') +
               '" style="width:' + w + 'px;background:' + bg + '"></div>';
      });
      return '<div class="gr" data-name="' + ch.nom.replace(/"/g, '&quot;') + '">' + cells + '</div>';
    }).join('');

    instance.data.calGrid.innerHTML = gridHtml;

    /* ── Liste des projets ───────────────────────────────────────── */
    var projHtml = chantiers.map(function(ch, ci) {
      return '<div class="pr" data-name="' + ch.nom.replace(/"/g, '&quot;') + '" data-idx="' + ci + '">' +
               '<div class="pn">' + ch.nom + '</div>' +
             '</div>';
    }).join('');

    instance.data.chantiersList = chantiers;
    instance.data.projList.innerHTML = projHtml;
    // Re-sync scroll après innerHTML (le scrollTop peut être réinitialisé par le browser)
    instance.data.projList.scrollTop = instance.data.rightPnl.scrollTop;
    instance.data.totSpan.textContent = 'Total : ' + chantiers.length;

    // Re-applique le highlight si un chantier était sélectionné avant le re-render
    if (instance.data.selectedIdx != null) {
      var pRows = instance.data.projList.querySelectorAll('.pr');
      var gRows = instance.data.calGrid.querySelectorAll('.gr');
      if (pRows[instance.data.selectedIdx]) pRows[instance.data.selectedIdx].classList.add('sel');
      if (gRows[instance.data.selectedIdx]) gRows[instance.data.selectedIdx].classList.add('sel');
    }

    /* ── Options du filtre statut ─────────────────────────────────── */
    if (statutsRaw && statutsRaw.length) {
      var curr = instance.data.currentStatutVal;
      var map  = {};
      instance.data.sddPanel.innerHTML =
        '<div class="sdd-item" data-val="">Tous les statuts</div>' +
        statutsRaw.map(function(s) {
          var lbl = osDisplay(s);
          map[lbl] = s;
          return '<div class="sdd-item" data-val="' + lbl.replace(/"/g, '&quot;') + '">' + lbl + '</div>';
        }).join('');
      instance.data.statutsMap = map;
      if (curr === null && !instance.data.statutInitialApplied && initSt) {
        instance.data.setStatut(initSt);
        instance.data.statutInitialApplied = true;
        instance.publishState('statut_selectionne', properties.statut_initial || null);
      } else {
        instance.data.setStatut(curr || '');
      }
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

    /* ── Ré-applique la recherche textuelle si active ────────────────── */
    if (instance.data.srchInp.value) {
      instance.data.applyFilters();
    }

    // Marque le rendu comme réussi (seulement ici, après tout le traitement)
    instance.data.lastHash = hash;
    instance.data.lastFp   = fp;
    if (instance.data.loaderEl) { instance.data.loaderEl.style.display = 'none'; }

  } finally {
    instance.data.isUpdating = false;
  }
}