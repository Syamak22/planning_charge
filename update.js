function(instance, properties, context) {

  /* ── Guards ──────────────────────────────────────────────────────── */
  if (instance.data.isUpdating) { console.log('[PC] STOP isUpdating'); return; }
  instance.data.isUpdating = true;

  try {
    if (!instance.data.initialized) { console.log('[PC] STOP not initialized'); return; }

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
    var champNom   = properties.champ_nom        || 'nom';
    var champChef  = properties.champ_chef       || 'chef';    // champ User sur le chantier
    var champCol   = properties.champ_couleur    || 'couleur'; // champ couleur sur le User
    var champRange = properties.champ_date_range || 'periode'; // champ date range sur le chantier

    var maxCh    = properties.max_chantiers || 15;
    var numWk    = properties.nb_semaines_visible || 26;
    var dateBase = d0(properties.date_debut) || d0(new Date());

    var chantiersRaw = readList(properties.chantiers_list);
    var joursOffRaw  = readList(properties.jours_off_list);
    var statutsRaw   = readList(properties.statuts_list);

    console.log('[PC] data: dateBase=', dateBase, '| chantiersRaw=', chantiersRaw ? chantiersRaw.length : null);

    if (!chantiersRaw) { console.log('[PC] STOP chantiersRaw null'); return; }

    /* ── Hash structurel (calendrier) ────────────────────────────── */
    // Les couleurs/périodes sont vérifiées plus bas (après CP4) via un fingerprint
    var hash = [
      dateBase.toDateString(),
      chantiersRaw.length,
      joursOffRaw ? joursOffRaw.length : 0,
      maxCh,
      numWk,
    ].join('|');
    console.log('[PC] CP1 hash=', hash);

    /* ── Constantes calendrier ───────────────────────────────────── */
    var CW       = 22;   // largeur cellule jour ouvré (px)
    var CWE      = 22;   // largeur cellule week-end (px)
    var CH       = 22;   // hauteur cellule (px)
    var CG       = 3;    // gap inter-cellules (px)
    var WS       = 8;    // séparateur de semaines (px)
    var NUM_WK   = numWk; // semaines affichées (property nb_semaines_visible, défaut 26)
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

    console.log('[PC] CP2 offSet done');

    /* ── Génération des jours calendrier ─────────────────────────── */
    // Démarrer le lundi de la semaine contenant dateBase
    var dow0      = dateBase.getDay();
    var startDate = new Date(dateBase);
    startDate.setDate(dateBase.getDate() - (dow0 === 0 ? 6 : dow0 - 1));

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
        isToday:   (d.toDateString() === dateBase.toDateString()),
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

    console.log('[PC] CP3 days/weeks done, days=', days.length, 'weeks=', weeks.length);

    /* ── Chantiers + période (date range sur le chantier) ────────── */
    var chantiers = chantiersRaw.map(function(ch, idx) {
      try {
        var nom   = ch.get(champNom) || '(sans nom)';
        var chef  = ch.get(champChef);
        var color = (chef && typeof chef.get === 'function' ? chef.get(champCol) : null) || '#9ca3af';

        // Le champ est un Bubble date range — retourné comme [start, end]
        var range  = ch.get(champRange);
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

        return { nom: nom, color: color, periods: periods };
      } catch(e) {
        if (!(e instanceof Error)) throw e; // "not ready" Bubble → laisser propager
        console.error('[PC] chantier[' + idx + '] crash:', e.message, '| ch=', ch);
        return { nom: '(erreur)', color: '#9ca3af', periods: [] };
      }
    });

    console.log('[PC] CP4 chantiers done, chantiers=', chantiers.length);

    /* ── Fingerprint couleurs + périodes : détecte les changements en base ── */
    var fp = chantiers.map(function(c) {
      return c.color + (c.periods.length ? c.periods[0].deb.getTime() + '-' + c.periods[0].fin.getTime() : '');
    }).join('|');
    if (instance.data.lastHash === hash && instance.data.lastFp === fp) {
      console.log('[PC] STOP hash+fp match');
      return;
    }

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

    console.log('[PC] CP5 activeMatrix done');

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

    console.log('[PC] RENDER hash=', hash, '| chantiers=', chantiers.length, '| days=', days.length, '| calHdr=', !!instance.data.calHdr, '| calGrid=', !!instance.data.calGrid);

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
    var projHtml = chantiers.map(function(ch) {
      return '<div class="pr" data-name="' + ch.nom.replace(/"/g, '&quot;') + '">' +
               '<div class="pn">' + ch.nom + '</div>' +
             '</div>';
    }).join('');

    instance.data.projList.innerHTML = projHtml;
    // Re-sync scroll après innerHTML (le scrollTop peut être réinitialisé par le browser)
    instance.data.projList.scrollTop = instance.data.rightPnl.scrollTop;
    instance.data.totSpan.textContent = 'Total : ' + chantiers.length;

    /* ── Options du filtre statut ─────────────────────────────────── */
    if (statutsRaw && statutsRaw.length) {
      var sel  = instance.data.stfSel;
      var curr = sel.value;
      sel.innerHTML = '<option value="">Tous les statuts</option>' +
        statutsRaw.map(function(s) {
          return '<option value="' + String(s).replace(/"/g, '&quot;') + '">' + s + '</option>';
        }).join('');
      if (curr) sel.value = curr;
    }

    /* ── Scroll initial vers dateBase ────────────────────────────── */
    if (instance.data.lastScrollDate !== dateBase.toDateString()) {
      var todayIdx = -1;
      for (var ti = 0; ti < days.length; ti++) {
        if (days[ti].isToday) { todayIdx = ti; break; }
      }
      if (todayIdx >= 0) {
        instance.data.rightPnl.scrollLeft = dayX[todayIdx];
      }
      instance.data.lastScrollDate = dateBase.toDateString();
    }

    /* ── Ré-applique la recherche si active ───────────────────────── */
    if (instance.data.srchInp.value) {
      var ev = document.createEvent('Event');
      ev.initEvent('input', true, true);
      instance.data.srchInp.dispatchEvent(ev);
    }

    // Marque le rendu comme réussi (seulement ici, après tout le traitement)
    instance.data.lastHash = hash;
    instance.data.lastFp   = fp;
    if (instance.data.loaderEl) { instance.data.loaderEl.style.display = 'none'; }
    console.log('[PC] DONE lastHash=', hash);

  } finally {
    instance.data.isUpdating = false;
  }
}
