/**
 * Les blocs marqués `.rv` montent de quelques pixels en entrant dans le champ.
 * On se désabonne dès qu'un bloc est apparu : l'observateur ne survit pas au
 * défilement de la page.
 */

const cibles = document.querySelectorAll<HTMLElement>('.rv');

if (cibles.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.1 },
  );
  // Décalage en cascade par groupes de trois : les cartes d'une même rangée
  // n'arrivent pas toutes ensemble.
  cibles.forEach((n, i) => {
    n.style.transitionDelay = `${(i % 3) * 70}ms`;
    io.observe(n);
  });
} else {
  cibles.forEach((n) => n.classList.add('in'));
}
