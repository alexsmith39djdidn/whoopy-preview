/* English mirror of ../demo-pudra.js — the recorded conversation on
   pudra.html, translated so the English page doesn't play the Russian
   script. Same timing and mechanics, added 06.08.2026. */

(function () {
  var chat = document.getElementById('demoChat');
  if (!chat) return;

  var slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollDown() {
    chat.scrollTo({ top: chat.scrollHeight, behavior: slow ? 'auto' : 'smooth' });
  }

  function bubble(who, text) {
    var el = document.createElement('div');
    el.className = 'msg ' + who;
    el.textContent = text;
    chat.appendChild(el);
    scrollDown();
    return el;
  }

  function typing() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    chat.appendChild(el);
    scrollDown();
    return el;
  }

  function pause(text) {
    if (slow) return 240;
    return Math.min(2600, 900 + String(text).length * 22);
  }

  function answer(text, after) {
    var t = typing();
    setTimeout(function () {
      t.remove();
      bubble('us', text);
      if (after) after();
    }, pause(text));
  }

  var SCRIPT = [
    { who: 'them', text: 'Hi! I’d like a cake for Saturday', wait: 900 },
    { who: 'us',   text: 'Hello. How many people, and what filling?' },
    { who: 'them', text: 'About ten, chocolate', wait: 2200 },
    { who: 'us',   text: 'Noted. Will you pick it up, or should we deliver?' },
    { who: 'them', text: 'Deliver it to Presnya, please', wait: 1800 },
    { who: 'us',   text: 'Courier on Saturday — 490 ₽. Total due 4,890 ₽, sending the QR code.' },
    { who: 'them', text: 'Paid', wait: 2600 },
    { who: 'us',   text: 'I see the payment. The order’s with the pastry chef — I’ll message when it’s ready.' }
  ];

  function play(i) {
    if (i >= SCRIPT.length) return;
    var step = SCRIPT[i];
    if (step.who === 'them') {
      setTimeout(function () {
        bubble('them', step.text);
        play(i + 1);
      }, slow ? 300 : (step.wait || 1200));
    } else {
      answer(step.text, function () { play(i + 1); });
    }
  }

  var seen = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !seen) {
        seen = true;
        play(0);
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(chat);
})();

(function () {
  var items = document.querySelectorAll('.belt-item');
  if (!items.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      en.target.classList.toggle('live', en.isIntersecting);
    });
  }, { threshold: 0.4 });
  items.forEach(function (el) { io.observe(el); });
})();
