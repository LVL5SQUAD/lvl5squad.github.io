// =====================================================
// UTILIDADES GENERALES
// =====================================================

const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =====================================================
// CONFIGURACIÓN GLOBAL
// =====================================================

const API_URL = 'https://levelfivesquad.com.ar/api/twitch/status';
const POLL_MS = 60_000;
const DEFAULT_CHANNEL = 'lvl5squad';

// ⚠️ SOLO PARA DESARROLLO VISUAL
const SIMULATE_LIVE = true;

// =====================================================
// FECHAS IMPORTANTES (UNA FUENTE CADA COSA)
// =====================================================

// 🎥 Próximo stream (PRE-LIVE)
const NEXT_STREAM_DATE = new Date("2026-01-31T21:00:00-03:00").getTime();
const PRELIVE_MINUTES = 30;

// 🎁 Sorteo
const EVENT_DATE = new Date("2026-01-31T21:00:00-03:00").getTime();

// =====================================================
// ESTADO VISUAL CENTRALIZADO (CLAVE)
// =====================================================

function setStreamState(state) {
  document.body.classList.remove('is-live', 'is-prelive');

  if (state === 'live') document.body.classList.add('is-live');
  if (state === 'prelive') document.body.classList.add('is-prelive');
}

// =====================================================
// PRE-LIVE AUTOMÁTICO (STREAM)
// =====================================================

function updatePreLiveState() {
  if (document.body.classList.contains('is-live')) return;

  const diff = NEXT_STREAM_DATE - Date.now();

  if (diff > 0 && diff <= PRELIVE_MINUTES * 60 * 1000) {
    setStreamState('prelive');
  }
}

// =====================================================
// TWITCH LIVE STATUS
// =====================================================

async function updateLiveUI() {
  const livePill  = document.getElementById('livePill');
  const liveCard  = document.getElementById('liveCard');
  const liveNote  = document.getElementById('liveNote');
  const viewerEl  = document.querySelector('#viewerCount span');
  const twitchBtn = document.getElementById('twitchBtn');

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');

    const { live, viewers, user } = await res.json();
    const channel = user || DEFAULT_CHANNEL;

    if (twitchBtn) twitchBtn.href = `https://twitch.tv/${channel}`;

    if (live) {
      setStreamState('live');

      livePill.textContent = '🔴 EN VIVO AHORA';
      livePill.classList.add('live');
      liveCard.classList.add('is-live');
      liveNote.textContent = '¡Entrá al stream!';
      viewerEl.textContent = viewers ?? 0;

      autoOpenChatIfLive(true);
    } else {
      updatePreLiveState();

      livePill.textContent = 'Offline';
      livePill.classList.remove('live');
      liveCard.classList.remove('is-live');
      liveNote.textContent = 'Seguinos en Twitch y activá notificaciones.';
      viewerEl.textContent = 0;
    }

  } catch {
    if (!SIMULATE_LIVE) return;

    setStreamState('live');
    livePill.textContent = '🔴 EN VIVO AHORA';
    livePill.classList.add('live');
    liveCard.classList.add('is-live');
    liveNote.textContent = '¡Entrá al stream!';
    viewerEl.textContent = Math.floor(Math.random() * 200) + 50;
  }
}

updateLiveUI();
setInterval(updateLiveUI, POLL_MS);

// =====================================================
// PRE-LIVE BADGE (ARRIBA)
// =====================================================

const preliveBadge = document.getElementById('preliveBadge');

function updatePreliveBadge() {
  if (!preliveBadge) return;

  const diff = NEXT_STREAM_DATE - Date.now();

  if (
    diff <= 0 ||
    document.body.classList.contains('is-live') ||
    diff > PRELIVE_MINUTES * 60 * 1000
  ) {
    preliveBadge.style.display = 'none';
    return;
  }

  preliveBadge.style.display = 'inline-flex';

  const minutes = Math.ceil(diff / 60000);
  preliveBadge.textContent =
    minutes <= 1
      ? '🔥 ARRANCA AHORA'
      : `⏳ ARRANCA EN ${minutes} MIN`;
}

updatePreliveBadge();
setInterval(updatePreliveBadge, 30_000);

// =====================================================
// CUENTA REGRESIVA DEL SORTEO (INDEPENDIENTE)
// =====================================================

const d = document.getElementById("cdDays");
const h = document.getElementById("cdHours");
const m = document.getElementById("cdMinutes");
const s = document.getElementById("cdSeconds");
const eventAlert = document.getElementById("eventAlert");

function updateCountdown() {
  const diff = EVENT_DATE - Date.now();

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "<strong>¡ES AHORA!</strong>";
    eventAlert?.classList.add("urgent");
    return;
  }

  d.textContent = Math.floor(diff / 86400000);
  h.textContent = Math.floor(diff / 3600000) % 24;
  m.textContent = Math.floor(diff / 60000) % 60;
  s.textContent = Math.floor(diff / 1000) % 60;

  eventAlert?.classList.toggle("urgent", diff <= 10 * 60 * 1000);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// =====================================================
// CHAT AUTO-OPEN
// =====================================================

const chatPanel = document.getElementById('chatPanel');

function autoOpenChatIfLive(isLive) {
  if (!isLive) return;
  if (sessionStorage.getItem('chatOpened')) return;

  setTimeout(() => {
    chatPanel?.classList.add('open');
    sessionStorage.setItem('chatOpened', '1');
  }, 1200);
}
