(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  if (reduceMotion || !canObserve) return;

  const revealTargets = new Set([
    ...document.querySelectorAll('#content > *:not(.spacer-32)'),
    ...document.querySelectorAll(
      '#content img.img-left, #content img.img-right, #content img.img-right-vert-mar'
    ),
    ...document.querySelectorAll(
      '.service-carousel__stage, .service-carousel__navigation, #footer'
    ),
    ...document.querySelectorAll('#wrap.contact form'),
  ]);

  if (revealTargets.length === 0) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -36px 0px',
  });

  revealTargets.forEach((target) => {
    target.classList.add('scroll-reveal');

    if (target.matches('img.img-left')) {
      target.classList.add('scroll-slide-in--left');
    } else if (target.matches('img.img-right, img.img-right-vert-mar')) {
      target.classList.add('scroll-slide-in--right');
    }

    observer.observe(target);
  });
})();
