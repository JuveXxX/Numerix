/**
 * @file ui.js
 * @description Couche de présentation — toutes les manipulations DOM sont ici.
 * game.js appelle les méthodes de cet objet, jamais document.getElementById directement.
 *
 * Objet global `UI`.
 */

const UI = (() => {

  const el = {
    input      : document.getElementById('nx-input'),
    btnValider : document.getElementById('nx-btn-valider'),
    btnRejouer : document.getElementById('nx-btn-rejouer'),
    difficulte : document.getElementById('nx-difficulte'),
    subtitle   : document.getElementById('nx-subtitle'),
    statCoups  : document.getElementById('stat-coups'),
    statTimer  : document.getElementById('stat-timer'),
    statEssais : document.getElementById('stat-essais'),
    feedback   : document.getElementById('nx-feedback'),
    history    : document.getElementById('nx-history'),
    badgeCoups : document.getElementById('badge-coups'),
    badgeTimer : document.getElementById('badge-timer'),
  };

  function setStatEtat(statEl, etat) {
    statEl.className = 'nx-stat-val' + (etat ? ' ' + etat : '');
  }

  function setBadgeEtat(badgeEl, etat) {
    badgeEl.className = 'nx-badge' + (etat ? ' ' + etat : '');
  }

  return {

    /* ── Accesseurs ────────────────────────────────────────────────────────── */
    getInput()      { return el.input;      },
    getDifficulte() { return el.difficulte; },
    getBtnValider() { return el.btnValider; },
    getBtnRejouer() { return el.btnRejouer; },

    lireValeur()     { return parseInt(el.input.value, 10); },
    lireDifficulte() { return parseInt(el.difficulte.value, 10); },

    /* ── Stepper ────────────────────────────────────────────────────────────
       0 = Tentative · 1 = Résultat · 2 = Verdict                           */
    setStep(n) {
      [0, 1, 2].forEach(i => {
        const step = document.getElementById('step-' + i);
        if (!step) return;
        step.querySelector('.nx-step-dot').className =
          'nx-step-dot' + (i < n ? ' done' : i === n ? ' current' : '');
        step.querySelector('.nx-step-label').className =
          'nx-step-label' + (i === n ? ' current' : '');
      });
    },

    /* ── Statistiques ───────────────────────────────────────────────────── */
    mettreAJourCoups(coups) {
      el.statCoups.textContent = coups;
      const e = coups <= 3 ? 'danger' : coups <= 5 ? 'warn' : '';
      setStatEtat(el.statCoups, e);
      setBadgeEtat(el.badgeCoups, coups <= 3 ? 'danger' : 'active');
    },

    mettreAJourTimer(secondes) {
      el.statTimer.textContent = secondes;
      const e = secondes <= 10 ? 'danger' : secondes <= 25 ? 'warn' : '';
      setStatEtat(el.statTimer, e);
      setBadgeEtat(el.badgeTimer, secondes <= 10 ? 'danger' : 'active');
    },

    mettreAJourEssais(essais) { el.statEssais.textContent = essais; },

    /* ── Intervalle ─────────────────────────────────────────────────────── */
    mettreAJourIntervalle(max) {
      el.input.setAttribute('max', max);
      if (el.subtitle && !el.subtitle.textContent.startsWith('Bonjour')) {
        el.subtitle.textContent = `1 \u2014 ${max} \u00a0\u00b7\u00a0 aucun indice`;
      }
    },

    /* ── Feedback ───────────────────────────────────────────────────────── */
    feedbackAttente() {
      el.feedback.className = 'nx-feedback empty';
      el.feedback.innerHTML = 'En attente de votre premier essai<span class="nx-cursor"></span>';
    },

    feedbackFaux() {
      el.feedback.className   = 'nx-feedback';
      el.feedback.textContent = 'Faux.';
    },

    feedbackVictoire(nombre, essais) {
      el.feedback.className = 'nx-feedback ok';
      el.feedback.innerHTML = `
        <div class="nx-feedback-number">${nombre}</div>
        <div class="nx-feedback-sublabel">
          Trouvé en ${essais} essai${essais > 1 ? 's' : ''}
        </div>`;
    },

    feedbackGameOver(nombre, raison) {
      el.feedback.className = 'nx-feedback';
      el.feedback.innerHTML = `
        <div class="nx-feedback-sublabel danger">${raison === 'temps' ? 'Temps écoulé' : 'Coups épuisés'}</div>
        <div class="nx-feedback-number">${nombre}</div>
        <div class="nx-feedback-sublabel">C'était le nombre</div>`;
    },

    feedbackErreur(msg) {
      el.feedback.className   = 'nx-feedback';
      el.feedback.textContent = msg;
    },

    /* ── Historique ─────────────────────────────────────────────────────── */
    ajouterHistorique(valeur) {
      const p = document.createElement('div');
      p.className   = 'nx-attempt';
      p.textContent = valeur;
      el.history.appendChild(p);
    },

    viderHistorique() { el.history.innerHTML = ''; },

    /* ── Contrôles ──────────────────────────────────────────────────────── */
    desactiverControles() { el.input.disabled = true;  el.btnValider.disabled = true;  },
    activerControles()    { el.input.disabled = false; el.btnValider.disabled = false; },
    focusInput()          { el.input.focus(); },
    viderInput()          { el.input.value = ''; },

    /* ── Réinitialisation complète ──────────────────────────────────────── */
    reinitialiser(coupsMax, secondesMax, borneMax) {
      this.mettreAJourCoups(coupsMax);
      this.mettreAJourTimer(secondesMax);
      this.mettreAJourEssais(0);
      this.mettreAJourIntervalle(borneMax);
      this.viderHistorique();
      this.viderInput();
      this.activerControles();
      this.feedbackAttente();
      this.setStep(0);
      setBadgeEtat(el.badgeCoups, 'active');
      setBadgeEtat(el.badgeTimer, 'active');
    },

  };

})();