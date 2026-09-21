/* Один наблюдатель на все живые схемы страниц-записей (04.08.2026).

   Правило простое: анимация идёт, только пока её блок на экране. Цикл,
   крутящийся за краем окна, — это сожжённая батарея у человека, который
   читает совсем другой абзац, и он об этом даже не узнает.

   Разметка: любому блоку со схемой ставим data-live. Скрипт вешает и
   снимает класс .live — вся анимация в CSS привязана к нему.

   Тем, кто просил систему не двигаться (prefers-reduced-motion), класс не
   выдаётся вовсе: схема остаётся в своём покойном виде и читается как
   обычный чертёж.                                                        */

(function () {
  var live = document.querySelectorAll('[data-live]');
  if (!live.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      en.target.classList.toggle('live', en.isIntersecting);
    });
  }, { threshold: 0.35 });

  live.forEach(function (el) { io.observe(el); });
})();

/* Появление вылетом — те же классы и числа, что на главной (.rev + --d).
   Заведено 05.08.2026 вместе с первым экраном страницы продукта: Саша
   попросил, чтобы блоки и тексты появлялись поочерёдно, как на главной.

   Почему не общий файл с home.js: у страниц разный набор скриптов (тут нет
   ни точек-оглавления, ни перепечатки заголовка), и ради десяти строк
   тащить на каждую внутреннюю страницу всю механику главной дороже, чем
   повторить наблюдатель. Числа при этом обязаны совпадать — они в CSS,
   и там файл один на обе стороны.

   Наблюдатель одноразовый: показали — отписались. Блок, который то
   появляется, то прячется при прокрутке вверх-вниз, читается как поломка. */
(function () {
  var items = document.querySelectorAll('.rev');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  items.forEach(function (el) { io.observe(el); });

  /* Страховка того же класса, что на главной: докрутили до самого низа —
     всё, что ещё не показалось, показываем. Наблюдатель мог не сработать
     не только из-за порога. */
  addEventListener('scroll', function () {
    if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
    document.querySelectorAll('.rev:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, { passive: true });
})();
