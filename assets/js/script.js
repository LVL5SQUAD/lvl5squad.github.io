// =====================================================
// Utilidades generales
// =====================================================

// Año automático
const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =====================================================
// CONFIGURACIÓN
// =====================================================

const API_URL = 'https://levelfivesquad.com.ar/api/twitch/status';
const POLL_MS = 60_000;
const DEFAULT_CHANNEL = 'lvl5squad';

// 🔴 Simulación visual (NO BORRAR)
const SIMULATE_LIVE = true;

// =====================================================
// Twitch Live Status
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

    twitchBtn.href = `https://twitch.tv/${channel}`;

// Estética siempre viva
document.body.classList.add('is-live');

// Estado real separado
document.body.toggleAttribute('data-live', live);

    if (live) {
      livePill.textContent = '🔴 EN VIVO AHORA';
      livePill.classList.add('live');
      liveCard.classList.add('is-live');
      liveNote.textContent = '¡Entrá al stream!';
      viewerEl.textContent = viewers ?? 0;
    } else {
      livePill.textContent = 'Offline';
      livePill.classList.remove('live');
      liveCard.classList.remove('is-live');
      liveNote.textContent = 'Seguinos en Twitch y activá notificaciones.';
      viewerEl.textContent = 0;
    }

  } catch (err) {
    // ⚠️ FALLBACK VISUAL
    if (!SIMULATE_LIVE) return;

    document.body.classList.add('is-live');

    livePill.textContent = '🔴 EN VIVO AHORA';
    livePill.classList.add('live');
    liveCard.classList.add('is-live');
    viewerEl.textContent = Math.floor(Math.random() * 200) + 50;
  }
}

// Primera carga + polling
updateLiveUI();
setInterval(updateLiveUI, POLL_MS);

// =====================================================
// TRANSICIÓN GO LIVE (NO TOCAR)
// =====================================================

if (SIMULATE_LIVE) {
  document.body.classList.add('go-live');
}

// =====================================================
// AUDIO LIVE
// =====================================================

const audio = document.getElementById('liveSound');
if (SIMULATE_LIVE && audio) {
  document.addEventListener('click', () => {
    audio.volume = 0.25;
    audio.play();
  }, { once: true });
}

// =====================================================
// VIEWERS FAKE (solo simulación)
// =====================================================

if (SIMULATE_LIVE) {
  const viewerEl = document.querySelector('#viewerCount span');
  let viewers = Math.floor(Math.random() * 200) + 50;
  viewerEl.textContent = viewers;

  setInterval(() => {
    viewers += Math.floor(Math.random() * 5 - 2);
    if (viewers < 20) viewers = 20;
    viewerEl.textContent = viewers;
  }, 3000);
}

// =====================================================
// Navbar hide / show on scroll
// =====================================================

const navbar = document.querySelector('.navbar');
let lastY = window.scrollY;

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  if (y > lastY && y > 80) {
    navbar.classList.add('nav-hidden');
  } else {
    navbar.classList.remove('nav-hidden');
  }

  lastY = y;
});

// =====================================================
// Banner parallax (SUAVE)
// =====================================================

const banner = document.querySelector('.header-banner');
if (banner && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    banner.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  });
}

// =====================================================
// Chat embebido
// =====================================================

const chatToggle = document.getElementById('chatToggle');
const chatPanel  = document.getElementById('chatPanel');
const chatClose  = document.getElementById('chatClose');

chatToggle?.addEventListener('click', () => chatPanel.classList.add('open'));
chatClose?.addEventListener('click', () => chatPanel.classList.remove('open'));

// =====================================================
// Cuenta regresiva evento
// =====================================================

const eventDate = new Date("2026-01-31T21:00:00-03:00").getTime();
const d = document.getElementById("cdDays");
const h = document.getElementById("cdHours");
const m = document.getElementById("cdMinutes");
const s = document.getElementById("cdSeconds");
const eventAlert = document.getElementById("eventAlert");

function updateCountdown() {
  const diff = eventDate - Date.now();

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "<strong>¡ES AHORA!</strong>";
    eventAlert.classList.add("urgent");
    return;
  }

  d.textContent = Math.floor(diff / 86400000);
  h.textContent = Math.floor(diff / 3600000) % 24;
  m.textContent = Math.floor(diff / 60000) % 60;
  s.textContent = Math.floor(diff / 1000) % 60;

  eventAlert.classList.toggle("urgent", diff < 10 * 60 * 1000);
}

updateCountdown();
setInterval(updateCountdown, 1000);
