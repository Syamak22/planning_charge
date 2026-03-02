function(instance, properties, context) {

  /* ── Guards ──────────────────────────────────────────────────────── */
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {
    if (!instance.data.initialized) { return; }

    /* ── Helpers ─────────────────────────────────────────────────── */
    function readList(ds) {
      if (!ds || typeof ds.length !== 'function') return null;
      var len = ds.length();
      return len === 0 ? [] : ds.get(0, len);
    }
    function d0(dt) {                        // normalise une date à minuit
      if (!dt) return null;
      var d = new Date(dt); d.setHours(0, 0, 0, 0);
      return isNaN(d.getTime()) ? null : d;
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
    var statutInitial = properties.statut_initial || '';
    var today        = d0(new Date());

    var chantiersRaw     = readList(properties.chantiers_list);
    var joursOffRaw      = readList(properties.jours_off_list);
    var statutsRaw       = readList(properties.statuts_list);
    var chantiersToutRaw = readList(properties.chantiers_tout_list);

    if (!chantiersRaw) { return; }

    /* ── Hash structurel (calendrier) ────────────────────────────── */
    // Les couleurs/périodes sont vérifiées plus bas (après CP4) via un fingerprint
    var hash = [
      today.toDateString(),
      chantiersRaw.length,
      joursOffRaw ? joursOffRaw.length : 0,
      chantiersToutRaw ? chantiersToutRaw.length : 0,
      maxCh,
      semPassees,
      semFutures,
      chartH,
      couleurNormal,
      couleurAlerte,
      couleurDanger,
      couleurLimite,
      seuilAlerte,
    ].join('|');

    /* ── Constantes calendrier ───────────────────────────────────── */
    var CW       = 22;   // largeur cellule jour ouvré (px)
    var CWE      = 22;   // largeur cellule week-end (px)
    var CH       = 22;   // hauteur cellule (px)
    var CG       = 3;    // gap inter-cellules (px)
    var WS       = 8;    // séparateur de semaines (px) 
    var NUM_WK   = semPassees + semFutures;
    var JOURS    = ['Di', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa'];
    var MOIS     = ['Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin',
                    'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

    /* ── Jours off (lookup O(1)) ─────────────────────────────────── */
    var offSet = {};
    if (joursOffRaw) {
      joursOffRaw.forEach(function(dt) {
        var nd = d0(dt);
        if (nd) offSet[nd.toDateString()] = true;
      });
    }

    /* ── Génération des jours calendrier ─────────────────────────── */
    // Démarrer le lundi de la semaine (today - semPassees semaines)
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
        moisSpans.push({ k: k, lbl: MOIS[day.m] + " '" + String(day.y).slice(2), fi: idx, li: idx });
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

    /* ── Chantiers + période (date range sur le chantier) ────────── */
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

    /* ── Fingerprint couleurs + périodes : détecte les changements en base ── */
    var fp = chantiers.map(function(c) {
      return c.color + (c.periods.length ? c.periods[0].deb.getTime() + '-' + c.periods[0].fin.getTime() : '');
    }).join('|');
    if (chantiersTout !== chantiers) {
      fp += '|T:' + chantiersTout.map(function(c) {
        return c.periods.length ? c.periods[0].deb.getTime() + '-' + c.periods[0].fin.getTime() : '';
      }).join('|');
    }
    if (instance.data.lastHash === hash && instance.data.lastFp === fp) { return; }

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

    /* ── En-tête calendrier ──────────────────────────────────────── */
    var mHtml = moisSpans.map(function(ms) {
      var last = days[ms.li];
      var w    = dayX[ms.li] + (last.isWeekend ? CWE : CW) - dayX[ms.fi];
      return '<div class="ms" style="width:' + w + 'px">' + ms.lbl + '</div>';
    }).join('');

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

    instance.data.calHdr.innerHTML =
      '<div class="mr">' + mHtml   + '</div>' +
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

    /* ── Graphique de charge — agrégation par mois (max journalier) ── */
    instance.data.chartPanel.style.height = chartH + 'px';

    // Un objet par mois : max des counts sur les jours ouvrés du mois
    var monthAgg = [];
    var curMo    = null;
    days.forEach(function(day, di) {
      var key = day.y + '-' + day.m;
      if (!curMo || curMo.key !== key) {
        curMo = { key: key, lbl: MOIS[day.m] + " '" + String(day.y).slice(2), max: 0 };
        monthAgg.push(curMo);
      }
      if (!day.isWeekend && !day.isOff && allCounts[di] > curMo.max) {
        curMo.max = allCounts[di];
      }
    });

    var nMonths  = monthAgg.length;
    var SVGH     = 100;
    var maxMo    = 0;
    monthAgg.forEach(function(mo) { if (mo.max > maxMo) maxMo = mo.max; });
    var maxY     = Math.max(maxCh, maxMo) * 1.25;
    if (maxY === 0) maxY = 10;

    function barColor(n) {
      if (n >= maxCh)       return couleurDanger;
      if (n >= seuilAlerte) return couleurAlerte;
      return couleurNormal;
    }

    var svgBars = monthAgg.map(function(mo, i) {
      var n = mo.max;
      if (n === 0) {
        return '<rect x="' + i + '" y="' + (SVGH - 1) + '" width="0.85" height="1" fill="#e5e7eb"/>';
      }
      var bh = (SVGH * n / maxY).toFixed(2);
      var by = (SVGH - SVGH * n / maxY).toFixed(2);
      return '<rect x="' + i + '" y="' + by + '" width="0.85" height="' + bh + '" fill="' + barColor(n) + '"/>';
    }).join('');

    // Chiffres en haut des barres (overlay HTML)
    var barLabels = monthAgg.map(function(mo, i) {
      var n = mo.max;
      if (!n || SVGH * n / maxY < 12) return '';  // barre trop petite
      var leftPct = ((i + 0.425) / nMonths * 100).toFixed(2);
      var topPct  = ((1 - n / maxY) * 100 + 2).toFixed(2);  // juste sous le sommet
      return '<span style="position:absolute;left:' + leftPct + '%;top:' + topPct + '%;' +
             'transform:translateX(-50%);font-size:8px;font-weight:700;' +
             'color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);line-height:1;">' + n + '</span>';
    }).join('');

    // Ligne rouge max_chantiers (overlay HTML, épaisseur fixe indépendante du scale)
    var lineTopPct = ((1 - maxCh / maxY) * 100).toFixed(2);
    var redLine = '<div style="position:absolute;left:0;right:0;top:' + lineTopPct + '%;' +
                  'height:2px;background:' + couleurLimite + ';pointer-events:none;z-index:2;"></div>';

    instance.data.chartArea.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + nMonths + ' ' + SVGH + '"' +
      ' preserveAspectRatio="none" style="width:100%;height:100%;display:block;">' +
      svgBars + '</svg>' +
      '<div style="position:absolute;inset:0;pointer-events:none;">' + barLabels + '</div>' +
      redLine;

    // Label centré sous chaque barre de mois
    instance.data.chartMonths.innerHTML = monthAgg.map(function(mo, i) {
      var pct = ((i + 0.425) / nMonths * 100).toFixed(2);
      return '<span style="position:absolute;left:' + pct + '%;transform:translateX(-50%);font-size:9px;' +
             'color:#9ca3af;white-space:nowrap;line-height:22px;">' + mo.lbl + '</span>';
    }).join('');

    // Axe Y : uniquement la valeur max_chantiers, alignée sur la ligne limite
    instance.data.chartYaxis.innerHTML =
      '<span style="position:absolute;right:8px;top:' + lineTopPct + '%;' +
      'transform:translateY(-50%);font-size:9px;font-weight:700;color:' + couleurLimite + ';line-height:1;">' +
      maxCh + '</span>';

    /* ── Options du filtre statut ─────────────────────────────────── */
    if (statutsRaw && statutsRaw.length) {
      var sel  = instance.data.stfSel;
      var curr = sel.value;
      sel.innerHTML = '<option value="">Tous les statuts</option>' +
        statutsRaw.map(function(s) {
          return '<option value="' + String(s).replace(/"/g, '&quot;') + '">' + s + '</option>';
        }).join('');
      // Restaure la sélection : choix de l'utilisateur, ou statut_initial au premier rendu
      var restoreVal = curr || (!instance.data.statutInitDone ? statutInitial : '');
      if (restoreVal) sel.value = restoreVal;
      instance.data.statutInitDone = true;
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
