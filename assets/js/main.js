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
