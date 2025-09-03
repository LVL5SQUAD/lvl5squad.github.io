// Año automático en el footer
document.getElementById('y').textContent = new Date().getFullYear();

// Mejora de accesibilidad: foco al destino de anclas internas
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      // Deja que el navegador haga el scroll (CSS smooth) y damos foco
      setTimeout(() => target.setAttribute('tabindex','-1'), 0);
      setTimeout(() => target.focus({preventScroll:true}), 300);
    }
  });
});

const API_URL = 'https://levelfivesquad.com.ar/api/twitch/status';

async function updateLiveUI() {
  const liveCard   = document.getElementById('liveCard');
  const livePill   = document.getElementById('livePill');
  const liveNote   = document.getElementById('liveNote');
  const liveInfo   = document.getElementById('liveInfo');
  const liveTitle  = document.getElementById('liveTitle');
  const liveViewers= document.getElementById('liveViewers');
  const liveEmbed  = document.getElementById('liveEmbed');
  const twitchBtn  = document.getElementById('twitchBtn');

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Respuesta no OK');
    const data = await res.json();

    const { live, title, viewers, user } = data;

    // Siempre el botón a tu canal
    twitchBtn.href = `https://twitch.tv/${user || 'lvl5squad'}`;

    if (live) {
      // Estado en vivo
      liveCard.classList.add('is-live');
      livePill.textContent = '🔴 En vivo ahora';
      liveNote.textContent = '¡Entrá al stream!';

      // Mostrar título y viewers si vienen
      liveInfo.style.display = 'block';
      liveTitle.textContent = title || 'Transmitiendo en Twitch';
      liveViewers.textContent = typeof viewers === 'number' ? `👀 Viewers: ${viewers}` : '';

      // Mostrar embed
      liveEmbed.style.display = 'block';
      liveEmbed.innerHTML = `
        <iframe
          src="https://player.twitch.tv/?channel=${encodeURIComponent(user || 'lvl5squad')}&parent=levelfivesquad.com.ar&muted=true"
          height="300"
          width="100%"
          frameborder="0"
          scrolling="no"
          allowfullscreen="true">
        </iframe>
      `;
    } else {
      // Estado offline
      liveCard.classList.remove('is-live');
      livePill.textContent = 'Offline';
      liveNote.textContent = 'Seguinos en Twitch y activá notificaciones.';
      liveInfo.style.display = 'none';
      liveEmbed.style.display = 'none';
      liveEmbed.innerHTML = '';
    }
  } catch (err) {
    console.error('Error consultando /api/twitch/status:', err);
    // Fallback seguro
    liveCard?.classList.remove('is-live');
    if (livePill) livePill.textContent = 'Estado no disponible';
    if (liveNote) liveNote.textContent = 'No se pudo obtener el estado de Twitch.';
    if (liveInfo) liveInfo.style.display = 'none';
    if (liveEmbed) {
      liveEmbed.style.display = 'none';
      liveEmbed.innerHTML = '';
    }
  }
}

// Primera carga
updateLiveUI();

// (Opcional) refrescar cada 60s mientras navegan
setInterval(updateLiveUI, 60_000);
