/**
 * @file ui.js
 * @description Couche de présentation — toutes les manipulations DOM sont ici.
 *
 * Aucune logique de jeu dans ce fichier.
 * game.js appelle les méthodes de cet objet pour mettre à jour l'écran.
 *
 * Expose l'objet global `UI`.
 */

const UI = (() => {

  // ── Références DOM ─────────────────────────────────────────────────────────
  const el = {
    input       : document.getElementById('nx-input'),
    btnValider  : document.getElementById('nx-btn-valider'),
    btnRejouer  : document.getElementById('nx-btn-rejouer'),
    difficulte  : document.getElementById('nx-difficulte'),
    subtitle    : document.getElementById('nx-subtitle'),
    statCoups   : document.getElementById('stat-coups'),
    statTimer   : document.getElementById('stat-timer'),
    statEssais  : document.getElementById('stat-essais'),
    feedback    : document.getElementById('nx-feedback'),
    history     : document.getElementById('nx-history'),
    badgeCoups  : document.getElementById('badge-coups'),
    badgeTimer  : document.getElementById('badge-timer'),
  };

  // ── Helpers privés ─────────────────────────────────────────────────────────

  /**
   * Met à jour l'état visuel d'une statistique (normal / warn / danger).
   * @param {HTMLElement} el   - Élément .nx-stat-val
   * @param {string}      etat - '' | 'warn' | 'danger'
   */
  function setStatEtat(statEl, etat) {
    statEl.className = 'nx-stat-val' + (etat ? ' ' + etat : '');
  }

  /**
   * Met à jour l'état d'un badge de contrainte.
   * @param {HTMLElement} badgeEl
   * @param {string}      etat    - 'active' | 'danger' | ''
   */
  function setBadgeEtat(badgeEl, etat) {
    badgeEl.className = 'nx-badge' + (etat ? ' ' + etat : '');
  }

  // ── API publique ───────────────────────────────────────────────────────────
  return {

    // ── Accesseurs DOM ────────────────────────────────────────────────────────

    /** @returns {HTMLInputElement} */
    getInput() { return el.input; },

    /** @returns {HTMLSelectElement} */
    getDifficulte() { return el.difficulte; },

    /** @returns {HTMLButtonElement} */
    getBtnValider() { return el.btnValider; },

    /** @returns {HTMLButtonElement} */
    getBtnRejouer() { return el.btnRejouer; },

    // ── Lecture de valeurs ────────────────────────────────────────────────────

    /**
     * Lit la valeur saisie et la convertit en entier.
     * @returns {number} Entier ou NaN si vide/invalide.
     */
    lireValeur() {
      return parseInt(el.input.value, 10);
    },

    /**
     * Lit la borne max choisie dans le sélecteur de difficulté.
     * @returns {number}
     */
    lireDifficulte() {
      return parseInt(el.difficulte.value, 10);
    },

    // ── Stepper éditorial ─────────────────────────────────────────────────────

    /**
     * Avance le stepper à l'étape donnée (0, 1 ou 2).
     *   0 = Tentative (en cours)
     *   1 = Résultat  (proposition soumise)
     *   2 = Verdict   (jeu terminé)
     *
     * @param {number} n - Index de l'étape courante.
     */
    setStep(n) {
      [0, 1, 2].forEach(i => {
        const step = document.getElementById('step-' + i);
        if (!step) return;
        const dot = step.querySelector('.nx-step-dot');
        const lbl = step.querySelector('.nx-step-label');

        dot.className = 'nx-step-dot' +
          (i < n ? ' done' : i === n ? ' current' : '');
        lbl.className = 'nx-step-label' +
          (i === n ? ' current' : '');
      });
    },

    // ── Statistiques ──────────────────────────────────────────────────────────

    /**
     * Met à jour le nombre de coups restants et son état visuel.
     * @param {number} coups - Valeur à afficher.
     */
    mettreAJourCoups(coups) {
      el.statCoups.textContent = coups;
      const etat = coups <= 3 ? 'danger' : coups <= 5 ? 'warn' : '';
      setStatEtat(el.statCoups, etat);
      setBadgeEtat(el.badgeCoups, coups <= 3 ? 'danger' : 'active');
    },

    /**
     * Met à jour le timer et son état visuel.
     * @param {number} secondes - Secondes restantes.
     */
    mettreAJourTimer(secondes) {
      el.statTimer.textContent = secondes;
      const etat = secondes <= 10 ? 'danger' : secondes <= 25 ? 'warn' : '';
      setStatEtat(el.statTimer, etat);
      setBadgeEtat(el.badgeTimer, secondes <= 10 ? 'danger' : 'active');
    },

    /**
     * Met à jour le compteur d'essais.
     * @param {number} essais
     */
    mettreAJourEssais(essais) {
      el.statEssais.textContent = essais;
    },

    // ── Sous-titre et sélecteur ───────────────────────────────────────────────

    /**
     * Met à jour le sous-titre et la borne max de l'input.
     * @param {number} max
     */
    mettreAJourIntervalle(max) {
      el.subtitle.textContent = `1 — ${max}  ·  aucun indice`;
      el.input.setAttribute('max', max);
    },

    // ── Feedback ──────────────────────────────────────────────────────────────

    /**
     * Affiche le message d'attente initial (curseur clignotant).
     */
    feedbackAttente() {
      el.feedback.className = 'nx-feedback empty';
      el.feedback.innerHTML = 'En attente de votre premier essai<span class="nx-cursor"></span>';
    },

    /**
     * Affiche "Faux." (mode difficile : aucun indice).
     */
    feedbackFaux() {
      el.feedback.className = 'nx-feedback';
      el.feedback.textContent = 'Faux.';
    },

    /**
     * Affiche l'écran de victoire avec le nombre trouvé en grand.
     * @param {number} nombre
     * @param {number} essais
     */
    feedbackVictoire(nombre, essais) {
      el.feedback.className = 'nx-feedback ok';
      el.feedback.innerHTML = `
        <div class="nx-feedback-number">${nombre}</div>
        <div class="nx-feedback-sublabel">
          Trouvé en ${essais} essai${essais > 1 ? 's' : ''}
        </div>
      `;
    },

    /**
     * Affiche l'écran de game over avec le nombre secret révélé.
     * @param {number} nombre  - Nombre secret à révéler.
     * @param {string} raison  - 'coups' | 'temps'
     */
    feedbackGameOver(nombre, raison) {
      const label = raison === 'temps' ? 'Temps écoulé' : 'Coups épuisés';
      el.feedback.className = 'nx-feedback';
      el.feedback.innerHTML = `
        <div class="nx-feedback-sublabel danger">${label}</div>
        <div class="nx-feedback-number">${nombre}</div>
        <div class="nx-feedback-sublabel">C'était le nombre</div>
      `;
    },

    /**
     * Affiche une erreur de saisie (valeur invalide ou hors bornes).
     * @param {string} message
     */
    feedbackErreur(message) {
      el.feedback.className = 'nx-feedback';
      el.feedback.textContent = message;
    },

    // ── Historique ────────────────────────────────────────────────────────────

    /**
     * Ajoute un essai raté dans l'historique (pastille barrée).
     * @param {number} valeur
     */
    ajouterHistorique(valeur) {
      const pill = document.createElement('div');
      pill.className = 'nx-attempt';
      pill.textContent = valeur;
      el.history.appendChild(pill);
    },

    /** Vide l'historique. */
    viderHistorique() {
      el.history.innerHTML = '';
    },

    // ── État des contrôles ────────────────────────────────────────────────────

    /** Désactive input + bouton Valider (fin de partie). */
    desactiverControles() {
      el.input.disabled = true;
      el.btnValider.disabled = true;
    },

    /** Réactive input + bouton Valider (début de partie). */
    activerControles() {
      el.input.disabled = false;
      el.btnValider.disabled = false;
    },

    /** Donne le focus au champ de saisie. */
    focusInput() {
      el.input.focus();
    },

    /** Vide le champ de saisie. */
    viderInput() {
      el.input.value = '';
    },

    // ── Réinitialisation complète ─────────────────────────────────────────────

    /**
     * Remet l'interface dans son état initial pour une nouvelle partie.
     * @param {number} coupsMax   - Nombre de coups alloués.
     * @param {number} secondesMax - Durée du countdown.
     * @param {number} borneMax   - Intervalle choisi.
     */
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

      // Réinitialiser les badges (état normal)
      setBadgeEtat(el.badgeCoups, 'active');
      setBadgeEtat(el.badgeTimer, 'active');
    },

  };

})();