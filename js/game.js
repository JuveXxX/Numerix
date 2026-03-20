/**
 * @file game.js
 * @description Logique principale — Numerix, édition difficile.
 *
 * Règles du mode difficile :
 *   - Pas d'indice chaud/froid : seul "Faux." est affiché.
 *   - Nombre de coups limité (COUPS_MAX, défaut 10).
 *   - Countdown actif (SECONDES_MAX, défaut 60s).
 *   - Aucune borne resserrée dans l'interface.
 *
 * Dépendances (chargées avant ce fichier) :
 *   - Timer (js/timer.js)
 *   - UI    (js/ui.js)
 *
 * Le module est encapsulé dans une IIFE pour éviter de polluer le scope global.
 */

(() => {

  // ==========================================================================
  // CONFIGURATION DU JEU
  // Modifier ces constantes pour ajuster la difficulté par défaut.
  // ==========================================================================

  const COUPS_MAX    = 10;   // Nombre max de tentatives par partie
  const SECONDES_MAX = 60;   // Durée du countdown en secondes

  // Clé localStorage pour persister le meilleur score
  const CLE_SCORE = 'numerix_hard_best';

  // ==========================================================================
  // ÉTAT DE LA PARTIE (privé au module)
  // ==========================================================================

  let nombreSecret  = 0;     // Nombre à deviner (régénéré à chaque partie)
  let borneMax      = 100;   // Intervalle [1, borneMax] selon la difficulté
  let coupsRestants = 0;     // Coups encore disponibles
  let essais        = 0;     // Total des propositions soumises
  let jeuActif      = false; // Verrou : false dès qu'une fin de partie est détectée
  let timerDemarre  = false; // Le timer démarre au 1er coup, pas au chargement

  // ==========================================================================
  // UTILITAIRES
  // ==========================================================================

  /**
   * Génère un entier aléatoire INCLUSIF entre min et max.
   * Math.floor(random * (max - min + 1)) + min garantit [min, max] sans 0.
   *
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function genererNombre(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ==========================================================================
  // GESTION DES FINS DE PARTIE
  // ==========================================================================

  /**
   * Traite la victoire du joueur.
   * Arrête le timer, affiche l'écran de victoire, sauvegarde le score.
   */
  function victoire() {
    jeuActif = false;
    Timer.stop();
    UI.desactiverControles();
    UI.setStep(2);
    UI.feedbackVictoire(nombreSecret, essais);

    const secondesUtilisees = SECONDES_MAX - Timer.getSecondes();
    sauvegarderScore(essais, secondesUtilisees);
  }

  /**
   * Traite une défaite (coups épuisés ou temps écoulé).
   * @param {'coups'|'temps'} raison
   */
  function defaite(raison) {
    jeuActif = false;
    Timer.stop();
    UI.desactiverControles();
    UI.setStep(2);
    UI.feedbackGameOver(nombreSecret, raison);
  }

  // ==========================================================================
  // CALLBACK DU TIMER (appelé chaque seconde par Timer.startCountdown)
  // ==========================================================================

  /**
   * Reçoit le nombre de secondes restantes et met à jour l'interface.
   * @param {number} secondesRestantes
   */
  function onTimerTick(secondesRestantes) {
    UI.mettreAJourTimer(secondesRestantes);
  }

  /**
   * Appelé quand le countdown atteint 0.
   */
  function onTimerEnd() {
    if (jeuActif) defaite('temps');
  }

  // ==========================================================================
  // MEILLEUR SCORE (localStorage)
  // ==========================================================================

  /**
   * Charge le meilleur score depuis localStorage.
   * @returns {{ essais: number, secondes: number } | null}
   */
  function chargerScore() {
    try {
      const raw = localStorage.getItem(CLE_SCORE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Sauvegarde le score si c'est le meilleur :
   *   critère 1 : moins d'essais
   *   critère 2 à égalité : moins de secondes utilisées
   *
   * @param {number} essais
   * @param {number} secondes - Temps utilisé (pas restant).
   */
  function sauvegarderScore(essais, secondes) {
    const ancien = chargerScore();
    const estMeilleur = !ancien ||
      essais < ancien.essais ||
      (essais === ancien.essais && secondes < ancien.secondes);

    if (estMeilleur) {
      try {
        localStorage.setItem(CLE_SCORE, JSON.stringify({ essais, secondes }));
      } catch {
        // localStorage peut être indisponible (navigation privée, quota, etc.)
      }
    }
  }

  // ==========================================================================
  // ACTION PRINCIPALE : PROPOSER UN NOMBRE
  // Appelée par le bouton Valider et la touche Entrée.
  // ==========================================================================

  /**
   * Valide la proposition du joueur.
   *
   * Pipeline :
   *   1. Vérification que le jeu est actif.
   *   2. Démarrage du timer au 1er coup.
   *   3. Validation de la saisie (NaN, hors bornes).
   *   4. Décrémentation des coups + avancement du stepper.
   *   5. Comparaison avec le nombre secret → victoire / faux / défaite.
   */
  function proposerNombre() {
    if (!jeuActif) return;

    // ── 1. Démarrer le timer au tout premier coup ────────────────────────────
    if (!timerDemarre) {
      timerDemarre = true;
      Timer.startCountdown(SECONDES_MAX, onTimerTick, onTimerEnd);
    }

    const valeur = UI.lireValeur();

    // ── 2. Validation : saisie vide ou non numérique ─────────────────────────
    if (isNaN(valeur)) {
      UI.feedbackErreur('Entrez un nombre');
      return;
    }

    // ── 3. Validation : hors intervalle ─────────────────────────────────────
    // Cette vérification DOIT précéder la comparaison avec le secret,
    // sinon les valeurs hors bornes (ex. -5) tomberaient dans le cas "< secret".
    if (valeur < 1 || valeur > borneMax) {
      UI.feedbackErreur(`Entre 1 et ${borneMax} uniquement`);
      return;
    }

    // ── 4. Coup valide ────────────────────────────────────────────────────────
    coupsRestants--;
    essais++;
    UI.mettreAJourCoups(coupsRestants);
    UI.mettreAJourEssais(essais);
    UI.setStep(1);      // Stepper passe à "Résultat"
    UI.viderInput();

    // ── 5. Comparaison avec le nombre secret ──────────────────────────────────
    if (valeur === nombreSecret) {
      victoire();
      return;
    }

    // Mauvaise réponse : enregistrer dans l'historique, afficher "Faux."
    UI.ajouterHistorique(valeur);
    UI.feedbackFaux();

    // Plus de coups → défaite immédiate
    if (coupsRestants <= 0) {
      defaite('coups');
      return;
    }

    // Revenir à l'étape "Tentative" après un court délai
    setTimeout(() => {
      if (jeuActif) {
        UI.setStep(0);
        UI.focusInput();
      }
    }, 700);
  }

  // ==========================================================================
  // NOUVELLE PARTIE
  // ==========================================================================

  /**
   * Initialise (ou réinitialise) une partie complète.
   *   - Lit la difficulté courante.
   *   - Génère un nouveau nombre secret.
   *   - Remet l'état interne et l'interface à zéro.
   */
  function nouvellePartie() {
    // Arrêter tout timer éventuellement en cours
    Timer.reset();

    // Lire la difficulté
    borneMax = UI.lireDifficulte();

    // Générer le nombre secret
    nombreSecret  = genererNombre(1, borneMax);
    coupsRestants = COUPS_MAX;
    essais        = 0;
    jeuActif      = true;
    timerDemarre  = false;

    // Mettre à jour l'interface
    UI.reinitialiser(COUPS_MAX, SECONDES_MAX, borneMax);
    UI.focusInput();
  }

  // ==========================================================================
  // INITIALISATION & ÉVÉNEMENTS
  // Brancher les listeners une seule fois au chargement de la page.
  // ==========================================================================

  function init() {

    // Bouton Valider
    UI.getBtnValider().addEventListener('click', proposerNombre);

    // Touche Entrée dans le champ
    UI.getInput().addEventListener('keydown', (e) => {
      if (e.key === 'Enter') proposerNombre();
    });

    // Bouton Nouvelle partie
    UI.getBtnRejouer().addEventListener('click', nouvellePartie);

    // Changement de difficulté → relance une partie
    UI.getDifficulte().addEventListener('change', nouvellePartie);

    // Lancer la première partie
    nouvellePartie();
  }

  // ── Point d'entrée ─────────────────────────────────────────────────────────
  init();

})();