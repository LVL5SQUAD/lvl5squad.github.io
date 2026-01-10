document.addEventListener('DOMContentLoaded', () => {

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
  // FECHAS IMPORTANTES
  // =====================================================

  const NEXT_STREAM_DATE = new Date('2026-01-31T21:00:00-03:00').getTime();
  const PRELIVE_MINUTES = 30;

  const EVENT_DATE = new Date('2026-01-31T21:00:00-03:00').getTime();

  // =====================================================
  // ESTADO VISUAL CENTRALIZADO
  // =====================================================

  function setStreamState(state) {
    document.body.classList.remove('is-live', 'is-prelive');
    if (state === 'live') document.body.classList.add('is-live');
    if (state === 'prelive') document.body.classList.add('is-prelive');
  }

  // =====================================================
  // PRE-LIVE AUTOMÁTICO
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
        // ================= LIVE REAL =================
        setStreamState('live');
        updateLiveAudio(true);
        stopFakeViewers();

        livePill.textContent = '🔴 EN VIVO AHORA';
        livePill.classList.add('live');
        liveCard.classList.add('is-live');
        liveNote.textContent = '¡Entrá al stream!';
        viewerEl.textContent = viewers ?? 0;
       
        autoOpenChatIfLive(true);

      } else {
        // ================= OFFLINE =================
        updatePreLiveState();
        updateLiveAudio(false);

        livePill.textContent = 'Offline';
        livePill.classList.remove('live');
        liveCard.classList.remove('is-live');
        liveNote.textContent = 'Seguinos en Twitch y activá notificaciones.';
   

        if (SIMULATE_LIVE) {
          startFakeViewers(viewerEl);
        } else {
          stopFakeViewers();
          viewerEl.textContent = 0;
        }
      }

    } catch (err) {
      if (!SIMULATE_LIVE) return;

      // ================= FALLBACK SIMULADO =================
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
  // PRE-LIVE BADGE (NAVBAR)
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
      minutes <= 1 ? '🔥 ARRANCA AHORA' : `⏳ ARRANCA EN ${minutes} MIN`;
  }

  updatePreliveBadge();
  setInterval(updatePreliveBadge, 30_000);

  // =====================================================
  // CUENTA REGRESIVA DEL SORTEO
  // =====================================================

  const d = document.getElementById('cdDays');
  const h = document.getElementById('cdHours');
  const m = document.getElementById('cdMinutes');
  const s = document.getElementById('cdSeconds');
  const eventAlert = document.getElementById('eventAlert');

  function updateCountdown() {
    const diff = EVENT_DATE - Date.now();

    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<strong>¡ES AHORA!</strong>';
      eventAlert?.classList.add('urgent');
      return;
    }

    d.textContent = Math.floor(diff / 86400000);
    h.textContent = Math.floor(diff / 3600000) % 24;
    m.textContent = Math.floor(diff / 60000) % 60;
    s.textContent = Math.floor(diff / 1000) % 60;

    eventAlert?.classList.toggle('urgent', diff <= 10 * 60 * 1000);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =====================================================
  // NAVBAR HIDE / SHOW
  // =====================================================

  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastScrollY && y > 80) navbar.classList.add('nav-hidden');
    else navbar.classList.remove('nav-hidden');
    lastScrollY = y;
  });

  // =====================================================
  // BANNER PARALLAX
  // =====================================================

  const banner = document.querySelector('.header-banner');
  if (banner && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      banner.style.transform = `translateY(${window.scrollY * 0.08}px)`;
    });
  }

  // =====================================================
  // CHAT EMBEBIDO
  // =====================================================

  const chatToggle = document.getElementById('chatToggle');
  const chatPanel  = document.getElementById('chatPanel');
  const chatClose  = document.getElementById('chatClose');

  chatToggle?.addEventListener('click', () => chatPanel.classList.add('open'));
  chatClose?.addEventListener('click', () => chatPanel.classList.remove('open'));

  function autoOpenChatIfLive(isLive) {
    if (!isLive) return;
    if (sessionStorage.getItem('chatOpened')) return;

    setTimeout(() => {
      chatPanel?.classList.add('open');
      sessionStorage.setItem('chatOpened', '1');
    }, 1200);
  }

  // =====================================================
  // AUDIO AMBIENTE (LIVE AUDIO)
  // =====================================================

  const audio = document.getElementById('liveSound');
  const soundIndicator = document.getElementById('soundIndicator');

  if (audio && soundIndicator) {

    const startAudio = () => {
      audio.volume = 0.25;
      audio.play().then(() => {
        soundIndicator.classList.add('playing');
      }).catch(() => {});
    };

    // Click explícito sobre el badge
    soundIndicator.addEventListener('click', startAudio);

    // Primer click en cualquier parte (fallback)
    document.addEventListener('click', startAudio, { once: true });

    // Si se pausa por alguna razón
    audio.addEventListener('pause', () => {
      soundIndicator.classList.remove('playing');
    });
}


  // =====================================================
  // VIEWERS FAKE (SOLO DESARROLLO)
  // =====================================================

  let fakeViewerInterval = null;

  function startFakeViewers(el) {
    if (fakeViewerInterval) return;

    let viewers = Math.floor(Math.random() * 40) + 20;
    el.textContent = viewers;

    fakeViewerInterval = setInterval(() => {
      viewers += Math.floor(Math.random() * 5 - 2);
      if (viewers < 12) viewers = 12;
      el.textContent = viewers;
    }, 2500);
}

function stopFakeViewers() {
  if (fakeViewerInterval) {
    clearInterval(fakeViewerInterval);
    fakeViewerInterval = null;
  }
}
// =====================================================
// LIVE AUDIO CONTROL (PARCHE)
// =====================================================

const liveAudio = document.getElementById('liveSound');

let audioUnlocked = false;

// Desbloqueo por interacción del usuario (obligatorio)
function unlockAudio() {
  if (!liveAudio || audioUnlocked) return;

  liveAudio.volume = 0.18; // ambiente, no molesto
  liveAudio.play().then(() => {
    audioUnlocked = true;
  }).catch(() => {
    // el navegador todavía no deja, esperamos otro click
  });
}

// Escuchamos cualquier interacción
['click','touchstart','keydown'].forEach(evt => {
  document.addEventListener(evt, unlockAudio, { once:true });
});

// Control según estado LIVE
function updateLiveAudio(isLive){
  if (!liveAudio || !audioUnlocked) return;

  if (isLive) {
    if (liveAudio.paused) {
      liveAudio.currentTime = 0;
      liveAudio.play().catch(()=>{});
    }
  } else {
    liveAudio.pause();
    liveAudio.currentTime = 0;
  }
}
});