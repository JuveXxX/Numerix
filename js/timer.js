/**
 * @file timer.js
 * @description Module chronomètre — supporte deux modes :
 *
 *   - Compte à rebours (countdown) : démarre depuis une valeur et décrémente.
 *   - Chronomètre classique (stopwatch) : part de 0 et incrémente.
 *
 * Ce fichier ne touche pas au DOM — il notifie via des callbacks.
 *
 * API publique (objet global `Timer`) :
 *   Timer.startCountdown(secondes, onTick, onEnd)
 *   Timer.startStopwatch(onTick)
 *   Timer.stop()
 *   Timer.reset()
 *   Timer.getSecondes()  → secondes restantes (countdown) ou écoulées (stopwatch)
 */

const Timer = (() => {

  // ── État privé ─────────────────────────────────────────────────────────────
  let valeur    = 0;        // Valeur courante (décroît ou croît selon le mode)
  let mode      = null;     // 'countdown' | 'stopwatch' | null
  let intervalle = null;    // Référence au setInterval actif
  let actif     = false;

  // ── Helpers privés ─────────────────────────────────────────────────────────

  /**
   * Arrête proprement l'intervalle interne.
   */
  function clearTimer() {
    clearInterval(intervalle);
    intervalle = null;
    actif = false;
  }

  // ── API publique ───────────────────────────────────────────────────────────
  return {

    /**
     * Démarre un compte à rebours.
     *
     * @param {number}   secondesInit - Durée totale en secondes (ex. 60).
     * @param {function} onTick       - Appelé chaque seconde avec la valeur restante.
     * @param {function} onEnd        - Appelé quand le compteur atteint 0.
     */
    startCountdown(secondesInit, onTick, onEnd) {
      clearTimer();
      valeur = secondesInit;
      mode   = 'countdown';
      actif  = true;

      intervalle = setInterval(() => {
        valeur--;
        if (typeof onTick === 'function') onTick(valeur);

        if (valeur <= 0) {
          clearTimer();
          if (typeof onEnd === 'function') onEnd();
        }
      }, 1000);
    },

    /**
     * Démarre un chronomètre croissant.
     *
     * @param {function} onTick - Appelé chaque seconde avec le temps écoulé.
     */
    startStopwatch(onTick) {
      clearTimer();
      valeur = 0;
      mode   = 'stopwatch';
      actif  = true;

      intervalle = setInterval(() => {
        valeur++;
        if (typeof onTick === 'function') onTick(valeur);
      }, 1000);
    },

    /**
     * Arrête le timer (sans remettre à zéro la valeur).
     */
    stop() {
      clearTimer();
    },

    /**
     * Arrête le timer et remet la valeur à 0.
     */
    reset() {
      clearTimer();
      valeur = 0;
      mode   = null;
    },

    /**
     * Retourne la valeur actuelle (secondes restantes ou écoulées).
     * @returns {number}
     */
    getSecondes() {
      return valeur;
    },

    /**
     * Indique si le timer est actuellement en cours.
     * @returns {boolean}
     */
    isActif() {
      return actif;
    },

  };

})();