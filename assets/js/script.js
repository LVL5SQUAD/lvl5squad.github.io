// =====================================================
// UTILIDADES GENERALES
// =====================================================

// Año automático
const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =====================================================
// CONFIGURACIÓN GLOBAL
// =====================================================

const API_URL = 'https://levelfivesquad.com.ar/api/twitch/status';
const POLL_MS = 60_000;
const DEFAULT_CHANNEL = 'lvl5squad';

// ⚠️ SOLO PARA DESARROLLO VISUAL
// Cuando Twitch esté activo en serio → false
const SIMULATE_LIVE = true;

// =====================================================
// ESTADO VISUAL CENTRALIZADO (CLAVE)
// =====================================================

function setLiveVisualState(isLive){
  document.body.classList.toggle('is-live', isLive);
}

// =====================================================
// TWITCH LIVE STATUS (REAL)
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

    // 🎨 Estado visual
    setLiveVisualState(live);

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
    // =================================================
    // FALLBACK VISUAL (NO ROMPE ESTÉTICA)
    // =================================================
    if (!SIMULATE_LIVE) return;

    setLiveVisualState(true);

    livePill.textContent = '🔴 EN VIVO AHORA';
    livePill.classList.add('live');
    liveCard.classList.add('is-live');
    liveNote.textContent = '¡Entrá al stream!';
    viewerEl.textContent = Math.floor(Math.random() * 200) + 50;
  }
}

// Primera carga + polling
updateLiveUI();
setInterval(updateLiveUI, POLL_MS);

// =====================================================
// TRANSICIÓN GO LIVE (SOLO VISUAL)
// =====================================================

if (SIMULATE_LIVE) {
  setLiveVisualState(true);
  document.body.classList.add('go-live');
}

// =====================================================
// AUDIO AMBIENTE LIVE
// =====================================================

const audio = document.getElementById('liveSound');
if (SIMULATE_LIVE && audio) {
  document.addEventListener('click', () => {
    audio.volume = 0.25;
    audio.play();
  }, { once:true });
}

// =====================================================
// VIEWERS FAKE (SOLO SIMULACIÓN)
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
// NAVBAR HIDE / SHOW AL SCROLL
// =====================================================

const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  if (y > lastScrollY && y > 80) {
    navbar.classList.add('nav-hidden');
  } else {
    navbar.classList.remove('nav-hidden');
  }

  lastScrollY = y;
});

// =====================================================
// BANNER PARALLAX (SUAVE)
// =====================================================

const banner = document.querySelector('.header-banner');
if (banner && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    banner.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  });
}

// =====================================================
// CHAT EMBEBIDO COLAPSABLE
// =====================================================

const chatToggle = document.getElementById('chatToggle');
const chatPanel  = document.getElementById('chatPanel');
const chatClose  = document.getElementById('chatClose');

chatToggle?.addEventListener('click', () => {
  chatPanel.classList.add('open');
});

chatClose?.addEventListener('click', () => {
  chatPanel.classList.remove('open');
});

// =====================================================
// CUENTA REGRESIVA EVENTO
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
    document.getElementById("countdown").innerHTML =
      "<strong>¡ES AHORA!</strong>";
    eventAlert.classList.add("urgent");
    return;
  }

  d.textContent = Math.floor(diff / 86400000);
  h.textContent = Math.floor(diff / 3600000) % 24;
  m.textContent = Math.floor(diff / 60000) % 60;
  s.textContent = Math.floor(diff / 1000) % 60;

  // Modo urgente últimos 10 minutos
  eventAlert.classList.toggle("urgent", diff <= 10 * 60 * 1000);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// =====================================================
// MODO HORARIO AUTOMÁTICO (AMBIENTE)
// =====================================================

function setTimeMode(){
  const hour = new Date().getHours();
  document.body.classList.remove('time-day', 'time-night', 'time-late');

  if (hour >= 7 && hour < 19) {
    document.body.classList.add('time-day');
  } else if (hour >= 19 && hour < 24) {
    document.body.classList.add('time-night');
  } else {
    document.body.classList.add('time-late');
  }
}

setTimeMode();
setInterval(setTimeMode, 10 * 60 * 1000);
