// ==============================
// Utilidades generales
// ==============================

// Año automático en el footer
const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mejora de accesibilidad: foco al destino de anclas internas
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', () => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => target.setAttribute('tabindex', '-1'), 0);
      setTimeout(() => target.focus({ preventScroll: true }), 300);
    }
  });
});

// ==============================
// Twitch Live Status
// ==============================

const API_URL = 'https://levelfivesquad.com.ar/api/twitch/status'; // tu Worker
const POLL_MS = 60_000;   // refrescar cada 60s
const MAX_RETRIES = 2;    // reintentos si falla
const DEFAULT_CHANNEL = 'lvl5squad';

// parents permitidos para el embed (prod y dev)
const TWITCH_PARENTS = [
  'levelfivesquad.com.ar',
  'www.levelfivesquad.com.ar',
  'lvl5squad.github.io',
  'localhost',
  '127.0.0.1'
];

// Construye la cadena de parents para Twitch (repetidos)
function parentParams() {
  return TWITCH_PARENTS.map(p => `parent=${encodeURIComponent(p)}`).join('&');
}

// Reintento con backoff simple
async function fetchWithRetry(url, { retries = MAX_RETRIES } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      // pequeño backoff
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

async function updateLiveUI() {
  const liveCard    = document.getElementById('liveCard');
  const livePill    = document.getElementById('livePill');
  const liveNote    = document.getElementById('liveNote');
  const liveInfo    = document.getElementById('liveInfo');
  const liveTitle   = document.getElementById('liveTitle');
  const liveViewers = document.getElementById('liveViewers');
  const liveEmbed   = document.getElementById('liveEmbed');

  // Botón puede ser #twitchBtn o .btn-twitch del header
  const twitchBtn   = document.getElementById('twitchBtn') || document.querySelector('.btn-twitch');

  try {
    const data = await fetchWithRetry(API_URL);
    const { live, title, viewers, user } = (data || {});
    const channel = user || DEFAULT_CHANNEL;

    // Link del botón a tu canal siempre
    if (twitchBtn) twitchBtn.href = `https://twitch.tv/${channel}`;

    if (live) {
      // 🔴 EN VIVO
      livePill?.classList.add('live');
      liveCard?.classList.add('is-live');

      if (livePill)   livePill.textContent = '🔴 EN VIVO AHORA';
      if (liveNote)   liveNote.textContent = '¡Entrá al stream!';
      if (liveInfo)   liveInfo.style.display = 'block';
      if (liveTitle)  liveTitle.textContent = title || 'Transmitiendo en Twitch';
      if (liveViewers) liveViewers.textContent =
        (typeof viewers === 'number' && viewers >= 0) ? `👀 Viewers: ${viewers}` : '';

      // Badge en el botón del nav
      if (twitchBtn) {
        twitchBtn.setAttribute('data-live', '1');
        if (typeof viewers === 'number') {
          twitchBtn.title = `En vivo • ${viewers} espectadores`;
        } else {
          twitchBtn.removeAttribute('title');
        }
      }

      // Mostrar embed (silenciado por default)
      if (liveEmbed) {
        liveEmbed.style.display = 'block';
        const parents = parentParams();
        const src = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parents}&muted=true`;
        liveEmbed.innerHTML = `
          <iframe
            src="${src}"
            height="300"
            width="100%"
            frameborder="0"
            scrolling="no"
            allowfullscreen="true">
          </iframe>
        `;
      }

    } else {
      // 📴 OFFLINE
      livePill?.classList.remove('live');
      liveCard?.classList.remove('is-live');

      if (livePill) livePill.textContent = 'Offline';
      if (liveNote) liveNote.textContent = 'Seguinos en Twitch y activá notificaciones.';

      if (liveInfo) liveInfo.style.display = 'none';
      if (liveEmbed) {
        liveEmbed.style.display = 'none';
        liveEmbed.innerHTML = '';
      }

      // Quitar badge del nav
      if (twitchBtn) {
        twitchBtn.removeAttribute('data-live');
        twitchBtn.removeAttribute('title');
      }
    }

  } catch (err) {
    console.error('Error consultando /api/twitch/status:', err);

    // Fallback seguro
    livePill?.classList.remove('live');
    liveCard?.classList.remove('is-live');

    if (livePill) livePill.textContent = 'Estado no disponible';
    if (liveNote) liveNote.textContent = 'No se pudo obtener el estado de Twitch.';

    if (liveInfo) liveInfo.style.display = 'none';
    if (liveEmbed) {
      liveEmbed.style.display = 'none';
      liveEmbed.innerHTML = '';
    }

    const twitchBtn = document.getElementById('twitchBtn') || document.querySelector('.btn-twitch');
    if (twitchBtn) {
      twitchBtn.removeAttribute('data-live');
      twitchBtn.removeAttribute('title');
    }
  }
}

// Primera carga
updateLiveUI();

// Refresco periódico
setInterval(updateLiveUI, POLL_MS);
