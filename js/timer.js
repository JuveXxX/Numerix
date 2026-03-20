/**
 * @file timer.js
 * @description Module chronomètre — aucune référence au DOM.
 *
 * Deux modes :
 *   - Compte à rebours (countdown) : décrémente depuis une valeur initiale.
 *   - Chronomètre (stopwatch)      : incrémente depuis 0.
 *
 * Notifications via callbacks → aucun couplage avec l'interface.
 *
 * API (objet global `Timer`) :
 *   Timer.startCountdown(secondes, onTick, onEnd)
 *   Timer.startStopwatch(onTick)
 *   Timer.stop()
 *   Timer.reset()
 *   Timer.getSecondes()   → valeur courante
 *   Timer.isActif()       → boolean
 */

const Timer = (() => {

  let valeur     = 0;
  let mode       = null;    // 'countdown' | 'stopwatch' | null
  let intervalle = null;
  let actif      = false;

  function clearTimer() {
    clearInterval(intervalle);
    intervalle = null;
    actif = false;
  }

  return {

    /**
     * Démarre un compte à rebours.
     * @param {number}   secondesInit - Durée totale.
     * @param {function} onTick       - Appelé chaque seconde (valeur restante).
     * @param {function} onEnd        - Appelé à l'expiration.
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
     * @param {function} onTick - Appelé chaque seconde (valeur écoulée).
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

    /** Arrête sans remettre à zéro. */
    stop()  { clearTimer(); },

    /** Arrête et remet à zéro. */
    reset() { clearTimer(); valeur = 0; mode = null; },

    /** @returns {number} */
    getSecondes() { return valeur; },

    /** @returns {boolean} */
    isActif() { return actif; },

  };

})();