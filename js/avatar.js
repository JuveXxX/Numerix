/**
 * @file avatar.js
 * @description Génération d'avatars géométriques SVG + gestion du dropdown profil.
 *
 * ── Principe de génération ───────────────────────────────────────────────────
 * Chaque avatar est une composition de 3 à 5 formes géométriques (cercles,
 * rectangles, triangles, losanges, hexagones, croix) superposées dans un
 * cercle clippé. La palette de couleurs (3 tons) et les positions sont
 * déterminées par un hash entier de la graine (seed) — le même seed produit
 * toujours le même avatar.
 *
 * La graine est générée aléatoirement à chaque session et lors d'un
 * clic "Regénérer". Elle est persistée en localStorage pour être retrouvée
 * au rechargement.
 *
 * ── Formes disponibles ───────────────────────────────────────────────────────
 *   circle · rect · triangle · diamond · hexagon · cross
 *
 * ── Palettes ─────────────────────────────────────────────────────────────────
 * 6 palettes bichromes, compatibles dark ET light (les tons sont volontairement
 * désaturés pour s'intégrer dans les deux thèmes).
 *
 * ── Interactions ─────────────────────────────────────────────────────────────
 *   - Clic sur l'avatar dans la navbar → ouvre / ferme le dropdown
 *   - Clic sur le grand avatar dans le dropdown → regénère
 *   - Clic sur "↻ Regénérer" → regénère
 *   - Clic en dehors du dropdown → ferme
 *
 * ── API publique (objet global `Avatar`) ─────────────────────────────────────
 *   Avatar.getSeed()       → seed courante
 *   Avatar.regenerate()    → nouvelle seed + re-render
 *   Avatar.render(seed)    → rend les deux SVG depuis une seed
 */

const Avatar = (() => {

  /* ── Constantes ─────────────────────────────────────────────────────────── */

  const CLE_SEED = 'numerix_avatar_seed';
  const CLE_SCORE = 'numerix_hard_best';

  /**
   * 6 palettes trichromes [clair, moyen, foncé].
   * Choisies pour rester lisibles sur fond sombre ET fond parchemin.
   */
  const PALETTES = [
    ['#c8b8a2', '#8a7a6a', '#4a3e32'],   // sable chaud
    ['#b8c8d0', '#6a8a98', '#2a4a58'],   // ardoise bleue
    ['#c8b0c8', '#8a6a8a', '#4a2a4a'],   // prune doux
    ['#b8c8a8', '#6a8a58', '#2a4a18'],   // mousse verte
    ['#d0c0a0', '#a08060', '#604020'],   // terre brûlée
    ['#b0b8c8', '#607088', '#203048'],   // nuit bleue
  ];

  /** Types de formes disponibles */
  const FORMES = ['circle', 'rect', 'triangle', 'diamond', 'hexagon', 'cross'];

  /* ── État ───────────────────────────────────────────────────────────────── */

  let seedCourante = '';

  /* ── Algorithme de hash / LCG ───────────────────────────────────────────── */

  /**
   * Hash djb2 simplifié d'une chaîne → entier 32 bits non signé.
   * Sert de point de départ pour le générateur pseudo-aléatoire.
   * @param {string} s
   * @returns {number} Entier ≥ 0
   */
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h >>> 0;  // unsigned
  }

  /**
   * Générateur congruentiel linéaire (LCG) — avance d'un pas.
   * Retourne le prochain entier 32 bits non signé.
   * @param {number} h - Valeur courante du LCG
   * @returns {number}
   */
  function lcg(h) {
    return ((h * 1664525 + 1013904223) | 0) >>> 0;
  }

  /**
   * Extrait un flottant dans [min, max[ depuis l'état LCG courant.
   * @param {number} h   - État LCG
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function rnd(h, min, max) {
    return min + (h / 0xffffffff) * (max - min);
  }

  /* ── Génération SVG ─────────────────────────────────────────────────────── */

  /**
   * Génère le contenu SVG interne (sans balise <svg>) d'un avatar géométrique.
   *
   * @param {string} seed  - Graine déterministe (même seed = même avatar)
   * @param {number} size  - Taille du viewBox carré (ex. 36 pour la navbar, 72 pour le dropdown)
   * @returns {string}     - HTML/SVG à injecter dans .innerHTML d'un <svg>
   */
  function genererSVG(seed, size) {
    let h = hash(seed);

    // Sélection palette et couleurs
    const palette = PALETTES[h % PALETTES.length];
    const [clair, moyen, fonce] = palette;
    const couleurs = [fonce, moyen, clair];

    const cx    = size / 2;
    const rayon = size * 0.38;

    // Identifiant unique pour le clipPath (évite les collisions si plusieurs SVG sur la page)
    const clipId = 'av-' + seed.replace(/\W/g, '').slice(0, 12);

    const parts = [];

    // Fond plein
    parts.push(`<circle cx="${cx}" cy="${cx}" r="${cx}" fill="${clair}"/>`);

    // ClipPath circulaire — les formes ne débordent pas du cercle
    parts.push(`<defs><clipPath id="${clipId}"><circle cx="${cx}" cy="${cx}" r="${cx}"/></clipPath></defs>`);
    parts.push(`<g clip-path="url(#${clipId})">`);

    // Nombre de formes : 3 à 5
    h = lcg(h);
    const nbFormes = 3 + (h % 3);

    for (let i = 0; i < nbFormes; i++) {

      // Forme
      h = lcg(h);
      const forme = FORMES[h % FORMES.length];

      // Position
      h = lcg(h); const x = rnd(h, cx * 0.1, cx * 1.3);
      h = lcg(h); const y = rnd(h, cx * 0.1, cx * 1.3);

      // Taille
      h = lcg(h); const sz = rnd(h, rayon * 0.3, rayon * 1.0);

      // Couleur
      h = lcg(h); const col = couleurs[h % 3];

      // Opacité
      h = lcg(h); const op = rnd(h, 0.55, 1.0).toFixed(2);

      // Rotation
      h = lcg(h); const rot = h % 360;

      const tf = `transform="rotate(${rot},${x.toFixed(1)},${y.toFixed(1)})"`;
      const xf = x.toFixed(1);
      const yf = y.toFixed(1);
      const sf = sz.toFixed(1);

      let el = '';

      switch (forme) {

        case 'circle':
          el = `<circle cx="${xf}" cy="${yf}" r="${sf}" fill="${col}" opacity="${op}"/>`;
          break;

        case 'rect':
          el = `<rect x="${(x - sz / 2).toFixed(1)}" y="${(y - sz / 2).toFixed(1)}"
                  width="${sf}" height="${sf}" fill="${col}" opacity="${op}" ${tf}/>`;
          break;

        case 'triangle': {
          const pts = [
            `${xf},${(y - sz).toFixed(1)}`,
            `${(x + sz * 0.866).toFixed(1)},${(y + sz * 0.5).toFixed(1)}`,
            `${(x - sz * 0.866).toFixed(1)},${(y + sz * 0.5).toFixed(1)}`,
          ].join(' ');
          el = `<polygon points="${pts}" fill="${col}" opacity="${op}" ${tf}/>`;
          break;
        }

        case 'diamond': {
          const pts = [
            `${xf},${(y - sz).toFixed(1)}`,
            `${(x + sz * 0.6).toFixed(1)},${yf}`,
            `${xf},${(y + sz).toFixed(1)}`,
            `${(x - sz * 0.6).toFixed(1)},${yf}`,
          ].join(' ');
          el = `<polygon points="${pts}" fill="${col}" opacity="${op}" ${tf}/>`;
          break;
        }

        case 'hexagon': {
          const pts = [];
          for (let a = 0; a < 6; a++) {
            const ang = (a * 60 * Math.PI) / 180;
            pts.push(`${(x + sz * Math.cos(ang)).toFixed(1)},${(y + sz * Math.sin(ang)).toFixed(1)}`);
          }
          el = `<polygon points="${pts.join(' ')}" fill="${col}" opacity="${op}" ${tf}/>`;
          break;
        }

        case 'cross': {
          const t = (sz * 0.28).toFixed(1);
          el = `<rect x="${(x - sz * 0.14).toFixed(1)}" y="${(y - sz / 2).toFixed(1)}"
                  width="${t}" height="${sf}" fill="${col}" opacity="${op}" ${tf}/>
                <rect x="${(x - sz / 2).toFixed(1)}" y="${(y - sz * 0.14).toFixed(1)}"
                  width="${sf}" height="${t}" fill="${col}" opacity="${op}" ${tf}/>`;
          break;
        }
      }

      parts.push(el);
    }

    parts.push('</g>');
    return parts.join('\n');
  }

  /* ── Rendu dans le DOM ───────────────────────────────────────────────────── */

  /**
   * Injecte les SVG générés dans les deux éléments de la page.
   * @param {string} seed
   */
  function rendreDansDOM(seed) {
    const svgNav    = document.getElementById('nx-avatar-svg');
    const svgLarge  = document.getElementById('nx-large-svg');
    if (svgNav)   svgNav.innerHTML   = genererSVG(seed, 36);
    if (svgLarge) svgLarge.innerHTML = genererSVG(seed, 72);
  }

  /* ── Dropdown ────────────────────────────────────────────────────────────── */

  /**
   * Lit et affiche le meilleur score depuis localStorage.
   * Appelé à chaque ouverture du dropdown.
   */
  function afficherScore() {
    const el = document.getElementById('nx-best-value');
    if (!el) return;
    try {
      const raw = localStorage.getItem(CLE_SCORE);
      const s   = raw ? JSON.parse(raw) : null;
      el.textContent = s
        ? `${s.essais} essai${s.essais > 1 ? 's' : ''} · ${s.secondes}s`
        : '—';
    } catch {
      el.textContent = '—';
    }
  }

  /* ── Initialisation ─────────────────────────────────────────────────────── */

  function init() {

    // ── Seed : restaurer depuis localStorage ou générer une nouvelle ─────────
    try {
      const saved = localStorage.getItem(CLE_SEED);
      seedCourante = saved || (Date.now().toString(36) + Math.random().toString(36).slice(2));
      if (!saved) localStorage.setItem(CLE_SEED, seedCourante);
    } catch {
      seedCourante = Date.now().toString(36);
    }

    // Rendu initial
    rendreDansDOM(seedCourante);

    // ── Dropdown ─────────────────────────────────────────────────────────────

    const avatarBtn  = document.getElementById('nx-avatar-btn');
    const dropdown   = document.getElementById('nx-dropdown');
    const avatarLarge= document.getElementById('nx-avatar-large');
    const regenBtn   = document.getElementById('nx-regen-btn');

    if (!avatarBtn || !dropdown) return;

    // Ouvrir / fermer le dropdown
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const estOuvert = !dropdown.hasAttribute('hidden');
      if (estOuvert) {
        dropdown.setAttribute('hidden', '');
        avatarBtn.setAttribute('aria-expanded', 'false');
      } else {
        dropdown.removeAttribute('hidden');
        avatarBtn.setAttribute('aria-expanded', 'true');
        afficherScore();
      }
    });

    // Fermer en cliquant en dehors
    document.addEventListener('click', () => {
      dropdown.setAttribute('hidden', '');
      avatarBtn.setAttribute('aria-expanded', 'false');
    });

    // Empêcher la fermeture quand on clique dans le dropdown
    dropdown.addEventListener('click', (e) => e.stopPropagation());

    // Regénérer via le grand avatar
    if (avatarLarge) {
      avatarLarge.addEventListener('click', (e) => {
        e.stopPropagation();
        Avatar.regenerate();
      });
    }

    // Regénérer via le bouton texte
    if (regenBtn) {
      regenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Avatar.regenerate();
      });
    }
  }

  // Le script est en fin de <body> — le DOM est disponible immédiatement
  init();

  /* ── API publique ───────────────────────────────────────────────────────── */
  return {

    /** @returns {string} Seed courante */
    getSeed() { return seedCourante; },

    /**
     * Génère une nouvelle seed aléatoire, re-rend les avatars et persiste.
     */
    regenerate() {
      seedCourante = Date.now().toString(36) + Math.random().toString(36).slice(2);
      try { localStorage.setItem(CLE_SEED, seedCourante); } catch {}
      rendreDansDOM(seedCourante);
    },

    /**
     * Rend les avatars depuis une seed donnée (utile pour les tests).
     * @param {string} seed
     */
    render(seed) {
      seedCourante = seed;
      rendreDansDOM(seed);
    },

  };

})();