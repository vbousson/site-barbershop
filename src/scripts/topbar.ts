/**
 * La barre haute flotte sur le lavis du hero, puis devient opaque dès qu'on
 * le quitte. Sur les pages sans hero, elle est opaque d'emblée.
 */

const bar = document.getElementById('top');
const hero = document.querySelector('.hero');

if (bar) {
  if (!hero) {
    bar.classList.add('solid');
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([e]) => bar.classList.toggle('solid', !e!.isIntersecting),
      { rootMargin: '-70px 0px 0px 0px' },
    ).observe(hero);
  }
}
