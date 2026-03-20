/**
 * @file game.js
 * @description Logique principale — Numerix, édition difficile.
 *
 * Mode difficile :
 *   - Aucun indice chaud/froid → seul "Faux." affiché
 *   - 10 coups maximum
 *   - Countdown 60 s démarrant au 1er coup
 *
 * Dépendances : Theme · Timer · UI · Avatar (chargés avant ce fichier)
 */

(() => {

  const COUPS_MAX    = 10;
  const SECONDES_MAX = 60;
  const CLE_SCORE    = 'numerix_hard_best';

  let nombreSecret  = 0;
  let borneMax      = 100;
  let coupsRestants = 0;
  let essais        = 0;
  let jeuActif      = false;
  let timerDemarre  = false;

  /* ── Utilitaires ─────────────────────────────────────────────────────────── */

  /** Entier aléatoire inclusif dans [min, max]. */
  function genererNombre(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ── Fins de partie ──────────────────────────────────────────────────────── */

  function victoire() {
    jeuActif = false;
    Timer.stop();
    UI.desactiverControles();
    UI.setStep(2);
    UI.feedbackVictoire(nombreSecret, essais);
    sauvegarderScore(essais, SECONDES_MAX - Timer.getSecondes());
  }

  function defaite(raison) {
    jeuActif = false;
    Timer.stop();
    UI.desactiverControles();
    UI.setStep(2);
    UI.feedbackGameOver(nombreSecret, raison);
  }

  /* ── Callbacks timer ─────────────────────────────────────────────────────── */

  function onTimerTick(s) { UI.mettreAJourTimer(s); }
  function onTimerEnd()   { if (jeuActif) defaite('temps'); }

  /* ── Score ───────────────────────────────────────────────────────────────── */

  function chargerScore() {
    try { return JSON.parse(localStorage.getItem(CLE_SCORE)); } catch { return null; }
  }

  function sauvegarderScore(essais, secondes) {
    const ancien = chargerScore();
    const mieux  = !ancien || essais < ancien.essais ||
                   (essais === ancien.essais && secondes < ancien.secondes);
    if (mieux) {
      try { localStorage.setItem(CLE_SCORE, JSON.stringify({ essais, secondes })); } catch {}
    }
  }

  /* ── Proposition ─────────────────────────────────────────────────────────── */

  function proposerNombre() {
    if (!jeuActif) return;

    // Démarrer le timer au 1er coup seulement
    if (!timerDemarre) {
      timerDemarre = true;
      Timer.startCountdown(SECONDES_MAX, onTimerTick, onTimerEnd);
    }

    const valeur = UI.lireValeur();

    if (isNaN(valeur)) {
      UI.feedbackErreur('Entrez un nombre');
      return;
    }

    // Validation hors-intervalle AVANT comparaison avec le secret
    if (valeur < 1 || valeur > borneMax) {
      UI.feedbackErreur(`Entre 1 et ${borneMax} uniquement`);
      return;
    }

    coupsRestants--;
    essais++;
    UI.mettreAJourCoups(coupsRestants);
    UI.mettreAJourEssais(essais);
    UI.setStep(1);
    UI.viderInput();

    if (valeur === nombreSecret) { victoire(); return; }

    UI.ajouterHistorique(valeur);
    UI.feedbackFaux();

    if (coupsRestants <= 0) { defaite('coups'); return; }

    setTimeout(() => {
      if (jeuActif) { UI.setStep(0); UI.focusInput(); }
    }, 700);
  }

  /* ── Nouvelle partie ─────────────────────────────────────────────────────── */

  function nouvellePartie() {
    Timer.reset();
    borneMax      = UI.lireDifficulte();
    nombreSecret  = genererNombre(1, borneMax);
    coupsRestants = COUPS_MAX;
    essais        = 0;
    jeuActif      = true;
    timerDemarre  = false;
    UI.reinitialiser(COUPS_MAX, SECONDES_MAX, borneMax);
    UI.focusInput();
  }

  /* ── Initialisation ──────────────────────────────────────────────────────── */

  function init() {
    UI.getBtnValider().addEventListener('click', proposerNombre);
    UI.getInput().addEventListener('keydown', (e) => { if (e.key === 'Enter') proposerNombre(); });
    UI.getBtnRejouer().addEventListener('click', nouvellePartie);
    UI.getDifficulte().addEventListener('change', nouvellePartie);
    nouvellePartie();
  }

  init();

})();