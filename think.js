/* Разборы: полоса прочитанного и абзацы, проявляющиеся по ходу чтения */
(function () {
  var bar = document.querySelector('.progress'), page = document.querySelector('.page');
  if (bar && page) {
    var set = function () {
      var r = page.getBoundingClientRect(), total = r.height - innerHeight;
      bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, total > 0 ? -r.top / total : 1)) + ')';
    };
    addEventListener('scroll', set, { passive: true }); addEventListener('resize', set); set();
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var els = [].slice.call(document.querySelectorAll('.page > p, .page > h2, .page > .pull'))
    .filter(function (el) { return el.getBoundingClientRect().top > innerHeight; });
  els.forEach(function (el) { el.classList.add('hide'); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('hide'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
