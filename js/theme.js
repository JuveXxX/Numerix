/**
 * @file theme.js
 * @description Gestion du thème dark / light.
 *
 * Chargé EN PREMIER dans index.html pour éviter le "flash of wrong theme" :
 * applique data-theme sur <html> avant le premier paint du navigateur.
 *
 * Branche ensuite le bouton pill flottant (#nx-theme-btn) une fois le DOM prêt.
 *
 * API publique (objet global `Theme`) :
 *   Theme.getCurrent()     → 'dark' | 'light'
 *   Theme.apply(mode)      → applique + persiste
 *   Theme.toggle()         → bascule
 */

const Theme = (() => {

  const CLE_STORAGE = 'numerix_theme';
  const MODE_DEFAUT = 'dark';

  /* ── Icônes SVG ─────────────────────────────────────────────────────────── */

  /** Soleil — affiché quand on est en mode dark (pour proposer Light) */
  const SVG_SOLEIL = `
    <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <line x1="8"    y1="1"    x2="8"    y2="2.8"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="8"    y1="13.2" x2="8"    y2="15"   stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="1"    y1="8"    x2="2.8"  y2="8"    stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="13.2" y1="8"    x2="15"   y2="8"    stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="3.2"  y1="3.2"  x2="4.5"  y2="4.5"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="11.5" y1="11.5" x2="12.8" y2="12.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="3.2"  y1="12.8" x2="4.5"  y2="11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="11.5" y1="4.5"  x2="12.8" y2="3.2"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  `;

  /** Lune — affichée quand on est en mode light (pour proposer Dark) */
  const SVG_LUNE = `
    <path d="M12 3.5A5.5 5.5 0 0 0 6.5 13 6.5 6.5 0 1 1 12 3.5z" fill="currentColor"/>
  `;

  /* ── État ───────────────────────────────────────────────────────────────── */

  let modeCourant = MODE_DEFAUT;

  /* ── Helpers privés ─────────────────────────────────────────────────────── */

  /**
   * Met à jour l'attribut data-theme et le contenu du bouton flottant.
   * @param {'dark'|'light'} mode
   */
  function appliquerDOM(mode) {
    document.documentElement.setAttribute('data-theme', mode);

    const icon  = document.getElementById('nx-theme-icon');
    const label = document.getElementById('nx-theme-label');
    if (!icon || !label) return;

    if (mode === 'dark') {
      icon.innerHTML    = SVG_SOLEIL;
      label.textContent = 'Light';
    } else {
      icon.innerHTML    = SVG_LUNE;
      label.textContent = 'Dark';
    }
  }

  /* ── Application immédiate (avant DOMContentLoaded) ─────────────────────
     Ce bloc s'exécute dès que le script est parsé, avant que le navigateur
     n'affiche quoi que ce soit → élimine le flash de mauvais thème.         */

  try {
    const s = localStorage.getItem(CLE_STORAGE);
    modeCourant = (s === 'dark' || s === 'light') ? s : MODE_DEFAUT;
  } catch {
    modeCourant = MODE_DEFAUT;
  }
  document.documentElement.setAttribute('data-theme', modeCourant);

  /* ── Branchement du bouton (après parsing du DOM) ──────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    appliquerDOM(modeCourant);

    const btn = document.getElementById('nx-theme-btn');
    if (btn) btn.addEventListener('click', () => Theme.toggle());
  });

  /* ── API publique ───────────────────────────────────────────────────────── */
  return {

    /** @returns {'dark'|'light'} */
    getCurrent() { return modeCourant; },

    /**
     * Applique un mode et le persiste en localStorage.
     * @param {'dark'|'light'} mode
     */
    apply(mode) {
      if (mode !== 'dark' && mode !== 'light') return;
      modeCourant = mode;
      appliquerDOM(mode);
      try { localStorage.setItem(CLE_STORAGE, mode); } catch {}
    },

    /** Bascule entre dark et light. */
    toggle() { this.apply(modeCourant === 'dark' ? 'light' : 'dark'); },

  };

})();