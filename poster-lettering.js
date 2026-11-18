document.addEventListener('DOMContentLoaded', function () {
  const chinese = document.documentElement.lang === 'zh-Hans';
  const tokenPattern = chinese ? /[「『（“]?[^\s][，。？！、」』）”……；：]*|\s+/gu : /\S+|\s+/gu;

  document.querySelectorAll('[data-poster-lettering]').forEach(function (element) {
    const text = element.textContent.trim();
    const readable = document.createElement('span');
    readable.className = 'intro-readable';
    readable.textContent = text;

    const ink = document.createElement('span');
    ink.setAttribute('aria-hidden', 'true');
    let index = 0;
    for (const token of text.match(tokenPattern)) {
      if (!token.trim()) {
        ink.append(token);
        continue;
      }

      const piece = document.createElement('span');
      piece.className = 'intro-piece';
      for (const character of token) {
        const letter = document.createElement('span');
        letter.className = 'intro-letter';
        letter.dataset.cut = index++ % 7;
        letter.textContent = character;
        piece.appendChild(letter);
      }
      ink.appendChild(piece);
    }
    element.replaceChildren(readable, ink);
  });
});
