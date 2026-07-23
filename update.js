function(instance, properties, context) {

  /* ── Guards ──────────────────────────────────────────────────────── */
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {
    if (!instance.data.initialized) { return; }
    if (instance.data.setCanvasHeight) { instance.data.setCanvasHeight(); }

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

    /* ── Properties ──────────────────────────────────────────────── */
    var fieldNom         = properties.field_cha_nom          || 'nom';
    var fieldDateDebut    = properties.field_cha_date_debut   || 'date_debut';
    var fieldDateFin      = properties.field_cha_date_fin     || 'date_fin';
    var fieldParent       = properties.field_cha_parent       || 'parent_chantier'; // champ chantier (relation vers le parent)
    var fieldHasChild     = properties.field_cha_has_child    || 'has_child';       // champ boolean : regroupement pur (pas de bande de chef)
    var fieldDateJoursOff = properties.field_date_jours_off   || 'date';            // champ date sur table_jours_off

    var fieldCdChantier   = properties.field_fk_chantier      || 'chantier';        // sur table_chef_date : relation vers le chantier
    var fieldCdDateDebut  = properties.field_cd_date_debut    || 'date_debut';
    var fieldCdDateFin    = properties.field_cd_date_fin      || 'date_fin';
    var fieldCdDuree      = properties.field_cd_duree         || 'duree';           // durée déjà calculée côté Bubble (affichage tooltip de la bande chef)
    var fieldCdChefChv    = properties.field_fk_chef_chv      || 'chef_chv';        // texte : id du User (chef interne)
    var fieldCdChefSst    = properties.field_fk_chef_sst      || 'chef_sst';        // texte : id du Contact (sous-traitant)

    var fieldUserName     = properties.field_user_name        || 'nom';
    var fieldUserCouleur  = properties.field_user_couleur     || 'couleur';
    var fieldContactName  = properties.field_contact_name     || 'nom';

    var cfg = {
      maxCh:         properties.max_chantiers || 15,
      couleurNormal: properties.couleur_normal || '#4ade80',
      couleurAlerte: properties.couleur_alerte || '#f97316',
      couleurDanger: properties.couleur_danger || '#dc2626',
      couleurLimite: properties.couleur_limite || '#dc2626',
      chartH:        (properties.chart_height != null && properties.chart_height >= 0)
                       ? Math.round(properties.chart_height) : 120,
    };
    cfg.seuilAlerte = (properties.seuil_alerte != null && properties.seuil_alerte > 0)
                        ? Math.round(properties.seuil_alerte) : Math.round(cfg.maxCh * 0.75);

    var today = d0(new Date());

    /* ── Longueurs uniquement pour le hash (pas de fetch complet) ── */
    function listLen(ds) {
      if (!ds) return null;
      if (typeof ds.length === 'function') return ds.length();
      if (typeof ds.length === 'number')   return ds.length;
      return null;
    }
    var chLen = listLen(properties.table_cha);
    var joLen = listLen(properties.table_jours_off) || 0;
    var cdLen = listLen(properties.table_chef_date) || 0;
    var usLen = listLen(properties.table_user) || 0;
    var coLen = listLen(properties.table_contact) || 0;

    if (chLen === null) { return; }

    /* ── Hash structurel ─────────────────────────────────────────── */
    var hash = [
      today.toDateString(),
      chLen, joLen, cdLen, usLen, coLen,
      cfg.maxCh, cfg.chartH,
      cfg.couleurNormal, cfg.couleurAlerte, cfg.couleurDanger, cfg.couleurLimite, cfg.seuilAlerte,
    ].join('|');

    /* ── Fetch chantiers + fingerprint (avant génération calendrier) ─ */
    var chantiersRaw = readList(properties.table_cha);

    function parseChantier(ch, idx) {
      try {
        var nom       = ch.get(fieldNom) || '(sans nom)';
        var deb       = d0(ch.get(fieldDateDebut));
        var fin       = d0(ch.get(fieldDateFin));
        var parentObj = ch.get(fieldParent);
        var parentId  = (parentObj && typeof parentObj.get === 'function') ? parentObj.get('_id') : null;
        var hasChild  = !!ch.get(fieldHasChild);
        var periods = (deb && fin) ? [{ deb: deb, fin: fin }] : [];
        return { id: ch.get('_id'), nom: nom, periods: periods, parentId: parentId, hasChild: hasChild, raw: ch };
      } catch(e) {
        if (!(e instanceof Error)) throw e;
        console.error('[PC] chantier[' + idx + '] crash:', e.message, '| ch=', ch);
        return { id: 'err-' + idx, nom: '(erreur)', periods: [], parentId: null, hasChild: false, raw: null };
      }
    }
    var chantiersAll = chantiersRaw.map(parseChantier);

    /* ── Users / Contacts (chefs) : maps id → {name, color}, pour résoudre chef_date en JS ── */
    function buildMap(ds, nameField, couleurField) {
      var map = {};
      var items = readList(ds);
      if (!items) return map;
      items.forEach(function(item) {
        if (!item || typeof item.get !== 'function') return;
        var id = item.get('_id');
        if (!id) return;
        map[id] = {
          name:  item.get(nameField) || '(sans nom)',
          color: couleurField ? (item.get(couleurField) || null) : null,
        };
      });
      return map;
    }
    var userById    = buildMap(properties.table_user,    fieldUserName,    fieldUserCouleur);
    var contactById = buildMap(properties.table_contact, fieldContactName, null);

    /* ── Fetch + parse chef_date (comptage équipes, join client-side sur field_fk_chantier) ── */
    var chefDateRaw = readList(properties.table_chef_date);
    function parseChefDate(cd, idx) {
      try {
        var chantierId  = cd.get(fieldCdChantier) || null; // champ Texte contenant l'id du chantier, pas une relation
        var deb = d0(cd.get(fieldCdDateDebut));
        var fin = d0(cd.get(fieldCdDateFin));
        var duree = cd.get(fieldCdDuree);
        var chefChv = cd.get(fieldCdChefChv) || null;
        var chefSst = cd.get(fieldCdChefSst) || null;
        var chefName = null, chefColor = null;
        if (chefChv && userById[chefChv]) {
          chefName  = userById[chefChv].name;
          chefColor = userById[chefChv].color;
        } else if (chefSst && contactById[chefSst]) {
          chefName  = contactById[chefSst].name;
        }
        return { chantierId: chantierId, deb: deb, fin: fin, duree: duree, chefName: chefName, chefColor: chefColor };
      } catch(e) {
        if (!(e instanceof Error)) throw e;
        console.error('[PC] chef_date[' + idx + '] crash:', e.message, '| cd=', cd);
        return { chantierId: null, deb: null, fin: null, duree: null, chefName: null, chefColor: null };
      }
    }
    // Un chantier regroupement (has_child) n'est pas une équipe réelle sur le terrain
    // → un chef_date rattaché à ce chantier ne doit pas compter.
    var validChantierIds = {};
    chantiersAll.forEach(function(c) { if (!c.hasChild) validChantierIds[c.id] = true; });
    var chefDates = (chefDateRaw || [])
      .map(parseChefDate)
      .filter(function(cd) { return cd.deb && cd.fin && cd.chantierId && validChantierIds[cd.chantierId]; });

    /* ── Résout une sélection d'item faite pendant que seul le cache était affiché ── */
    if (instance.data.pendingSelectId) {
      var match = null;
      for (var mi = 0; mi < chantiersAll.length; mi++) {
        if (chantiersAll[mi].id === instance.data.pendingSelectId) { match = chantiersAll[mi]; break; }
      }
      if (match && match.raw) {
        instance.data.isUpdating = true; // déjà true (guard englobant) mais explicite ici
        instance.publishState('selected_chantier', match.raw);
        instance.triggerEvent('chantier_selectionne');
        instance.data.pendingSelectId = null;
      }
    }

    /* ── Séparation parents (base des lignes affichées) / enfants (sous-chantiers) ── */
    var chantiers    = chantiersAll.filter(function(c) { return !c.parentId; });
    var childrenMap  = {};
    chantiersAll.forEach(function(c) {
      if (c.parentId) {
        if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
        childrenMap[c.parentId].push(c);
      }
    });

    /* ── Fingerprint périodes + hiérarchie + chef_date ─────────────── */
    var fp = chantiersAll.map(function(c) {
      return (c.periods.length ? c.periods[0].deb.getTime() + '-' + c.periods[0].fin.getTime() : '')
        + ':' + (c.parentId || '') + ':' + (c.hasChild ? 1 : 0);
    }).join('|') + '||' + chefDates.map(function(cd) {
      return cd.chantierId + ':' + cd.deb.getTime() + '-' + cd.fin.getTime() + ':' + (cd.duree != null ? cd.duree : '') + ':' + (cd.chefName || '') + ':' + (cd.chefColor || '');
    }).join('|');

    /* ── Sortie anticipée : avant toute génération calendrier/DOM ── */
    if (instance.data.lastHash === hash && instance.data.lastFp === fp) { return; }

    /* ── Fetch listes restantes (uniquement si re-render nécessaire) ─ */
    var joursOffRaw = readList(properties.table_jours_off);

    /* ── Jours off (lookup O(1)) ─────────────────────────────────── */
    var offSet = {};
    if (joursOffRaw) {
      joursOffRaw.forEach(function(item) {
        var dt = (item && typeof item.get === 'function') ? item.get(fieldDateJoursOff) : item;
        var nd = d0(dt);
        if (nd) offSet[nd.toDateString()] = true;
      });
    }

    /* ── Rendu (logique + DOM partagés, voir initialize.js → renderPlanning) ── */
    instance.data.renderPlanning(chantiersAll, childrenMap, chantiers, chefDates, offSet, cfg);

    /* ── Cache localStorage : pour un rendu instantané au prochain chargement ── */
    instance.data.saveCache({
      chantiers: chantiersAll.map(function(c) {
        return {
          id: c.id, nom: c.nom, parentId: c.parentId, hasChild: c.hasChild,
          periods: c.periods.map(function(p) { return { deb: p.deb.getTime(), fin: p.fin.getTime() }; }),
        };
      }),
      chefDates: chefDates.map(function(cd) {
        return { chantierId: cd.chantierId, deb: cd.deb.getTime(), fin: cd.fin.getTime(), duree: cd.duree, chefName: cd.chefName, chefColor: cd.chefColor };
      }),
      joursOff: (joursOffRaw || []).map(function(item) {
        var dt = (item && typeof item.get === 'function') ? item.get(fieldDateJoursOff) : item;
        var d = d0(dt);
        return d ? d.getTime() : null;
      }).filter(function(t) { return t != null; }),
      config: cfg,
    });

    // Marque le rendu comme réussi (seulement ici, après tout le traitement)
    instance.data.lastHash = hash;
    instance.data.lastFp   = fp;

  } finally {
    instance.data.isUpdating = false;
  }
}