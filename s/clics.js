(function () {
  'use strict';

  var CONNUS = [
    [/(^|\.)m\.me$/, 'messenger'],
    [/(^|\.)g\.page$/, 'avis-google'],
    [/(^|\.)facebook\.com$/, 'facebook'],
    [/(^|\.)instagram\.com$/, 'instagram'],
    [/(^|\.)google\.[a-z.]+$/, 'google']
  ];

  function slug(t) {
    return String(t || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  function propre(t) {
    return String(t || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function page() {
    var p = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index';
    p = p.replace(/\.html?$/, '');
    return slug(p) || 'index';
  }

  var SEL = 'a[href],button,summary,[role="button"],[role="tab"],[data-clic],input[type="submit"],input[type="button"],label';

  function cible(el) {
    var n = el, i;
    if (el.closest) {
      n = el.closest(SEL);
      if (n && n.tagName === 'LABEL') {
        var c = n.querySelector('a[href],button');
        if (!c) {
          var idc = n.getAttribute('for');
          var ctl = idc && document.getElementById(idc);
          var ci = ctl || n.querySelector('input[type="checkbox"],input[type="radio"]');
          if (ci && /^(checkbox|radio)$/.test(ci.type || '')) return n;
          n = null;
        }
      }
    }
    if (n) return n;
    n = el;
    for (i = 0; n && n.nodeType === 1 && i < 6; i++, n = n.parentElement) {
      if (n === document.body) break;
      var cs = window.getComputedStyle(n);
      if (cs && cs.cursor === 'pointer') return n;
    }
    return null;
  }

  function zone(el) {
    var z = [], haut = null, plan = false, n = el;
    while (n && n.nodeType === 1 && n !== document.body) {
      if (n.matches('details.plan') && el.tagName !== 'SUMMARY') plan = true;
      if (!haut) {
        if (n.getAttribute('data-clic-zone')) haut = slug(n.getAttribute('data-clic-zone'));
        else if (n.matches('.avis-haut')) haut = 'haut-de-page';
        else if (n.matches('header')) haut = 'entete';
        else if (n.matches('footer')) haut = 'pied';
        else if (n.matches('.parler.flot')) haut = 'flottant';
        else if (n.matches('[role="dialog"],dialog,.loupe,#loupe')) haut = 'loupe';
        else if (n.matches('section[id],main [id].salle,#salle')) haut = slug(n.id);
      }
      n = n.parentElement;
    }
    z.push(haut || 'page');
    if (plan) z.push('plan-du-site');
    return z.join('/');
  }

  function premierTexte(el) {
    var n = el.firstChild;
    for (; n; n = n.nextSibling) {
      var t = '';
      if (n.nodeType === 3) t = n.nodeValue;
      else if (n.nodeType === 1 && !n.matches('.sr,[aria-hidden="true"],script,style')) t = premierTexte(n);
      if (propre(t)) return propre(t);
    }
    return '';
  }

  function etiquette(el) {
    var d = el.getAttribute('data-clic');
    if (d) return null;
    if (el.matches('.btn-promo[href*="facebook"]')) return 'promo-du-moment';
    if (el.tagName === 'A' && el.getAttribute('href') !== null) {
      var h = el.getAttribute('href'), u;
      if (/^tel:/i.test(h)) return 'telephone';
      if (/^mailto:/i.test(h)) return 'courriel';
      if (/^sms:/i.test(h)) return 'sms';
      try { u = new URL(h, location.href); } catch (e) { u = null; }
      if (u && u.origin !== location.origin) {
        for (var i = 0; i < CONNUS.length; i++) if (CONNUS[i][0].test(u.hostname)) return 'sortant-' + CONNUS[i][1];
        return 'sortant-' + slug(u.hostname.replace(/^www\./, ''));
      }
      if (u) {
        var f = u.pathname.replace(/\/+$/, '').split('/').pop().replace(/\.html?$/, '');
        var meme = u.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');
        if (/\.(pdf|vcf|png|jpe?g|webp|zip)$/i.test(u.pathname)) return 'fichier-' + slug(u.pathname.split('/').pop());
        if (u.hash && u.hash.length > 1) return (meme ? '' : slug(f || 'accueil') + '-') + 'ancre-' + slug(u.hash.slice(1));
        return slug(f) || 'accueil';
      }
    }
    var t = el.id ? slug(el.id) : '';
    if (t) return t;
    var txt = el.getAttribute('data-fr') || el.getAttribute('data-fr-label') || el.getAttribute('aria-label') ||
      (el.tagName === 'INPUT' ? el.value : '') || premierTexte(el);
    t = slug(txt);
    if (t) {
      var g = el.closest && el.closest('[role="group"][id]');
      if (g && g !== el) t = slug(g.id).replace(/^seg-/, '') + '-' + t;
      return t;
    }
    var img = el.querySelector && el.querySelector('img[alt]');
    if (img) { t = slug(img.getAttribute('alt')); if (t) return t; }
    var cl = (el.className && el.className.baseVal === undefined ? String(el.className) : '').split(/\s+/)[0];
    return slug(cl) || 'sans-nom';
  }

  function nom(el) {
    var d = el.getAttribute('data-clic');
    if (d) {
      d = d.replace(/^\/+/, '');
      return /^clic\//.test(d) ? d : 'clic/' + page() + '/' + d;
    }
    if (el.matches('a.badge-lien[href*="scannez-votre-carte"]')) return 'clic/' + page() + '/pastille-scan';
    return 'clic/' + page() + '/' + zone(el) + '/' + etiquette(el);
  }

  function titre(el) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(submit|button)$/.test(el.type || '')) return '';
    var t = el.getAttribute('data-fr') || el.getAttribute('aria-label') || premierTexte(el) || (el.value || '');
    if (!el.getAttribute('data-fr') && el.tagName === 'A' && !propre(t)) {
      var im = el.querySelector('img[alt]');
      t = im ? im.getAttribute('alt') : '';
    }
    return propre(t);
  }

  var dernier = { n: '', t: 0 };

  function envoyer(n, t, essais) {
    var gc = window.goatcounter;
    if (gc && typeof gc.count === 'function') {
      try { gc.count({ path: n, title: t, event: true }); } catch (e) {}
      return;
    }
    if ((essais || 0) < 24) setTimeout(function () { envoyer(n, t, (essais || 0) + 1); }, 250);
  }

  function surClic(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    if (!e.target || e.target.nodeType !== 1) return;
    var el = cible(e.target);
    if (!el) return;
    if (el.tagName === 'INPUT' && !/^(submit|button)$/.test(el.type || '')) return;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
    var n = nom(el), now = Date.now();
    if (n === dernier.n && now - dernier.t < 400) return;
    dernier = { n: n, t: now };
    envoyer(n, titre(el), 0);
  }

  document.addEventListener('click', surClic, true);
  document.addEventListener('auxclick', surClic, true);

  window.clicsMCA = {
    nom: nom,
    titre: titre,
    cliquables: function () {
      var out = [], vus = [];
      var els = document.querySelectorAll(SEL);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.tagName === 'INPUT' && !/^(submit|button)$/.test(el.type || '')) continue;
        if (el.tagName === 'LABEL' && cible(el) !== el) continue;
        out.push({ nom: nom(el), titre: titre(el) });
      }
      return out;
    }
  };
})();
