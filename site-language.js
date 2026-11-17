(function () {
  const current = new URL(location.href);
  const requested = current.searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem('portfolio-language'); } catch {}
  const language = requested === 'zh' || requested === 'en' ? requested : saved === 'zh' ? 'zh' : 'en';
  const chinese = language === 'zh';
  document.documentElement.lang = chinese ? 'zh-Hans' : 'en';
  if (document.documentElement.hasAttribute('xml:lang')) {
    document.documentElement.setAttribute('xml:lang', document.documentElement.lang);
  }
  try { localStorage.setItem('portfolio-language', language); } catch {}

  function url(href, targetLanguage = language) {
    const destination = new URL(href, current);
    destination.searchParams.set('lang', targetLanguage);
    return destination.href;
  }

  function text(english, translation) {
    return chinese ? translation : english;
  }

  window.SiteLanguage = { text, url };

  document.addEventListener('DOMContentLoaded', function () {
    if (chinese) {
      document.querySelectorAll('[data-zh]').forEach(function (element) {
        element.textContent = element.dataset.zh;
      });
      const attributes = ['alt', 'aria-label', 'aria-description', 'title', 'placeholder', 'data-label', 'data-lightbox-alt'];
      for (const attribute of attributes) {
        document.querySelectorAll('[data-zh-' + attribute + ']').forEach(function (element) {
          element.setAttribute(attribute, element.getAttribute('data-zh-' + attribute));
        });
      }
    }

    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (/^(?![a-z][a-z0-9+.-]*:|\/\/|#)[^?#]+\.html(?:[?#]|$)/i.test(href)) {
        link.href = url(href);
      }
    });

    const picker = document.createElement('nav');
    picker.className = 'site-language';
    picker.setAttribute('aria-label', text('Page language', '页面语言'));
    for (const [code, label, lang] of [['en', 'English', 'en'], ['zh', '中文', 'zh-Hans']]) {
      const link = document.createElement('a');
      link.href = url(current, code);
      link.lang = lang;
      link.hreflang = lang;
      link.textContent = label;
      if (code === language) link.setAttribute('aria-current', 'page');
      picker.appendChild(link);
    }
    const slot = document.querySelector('[data-language-picker]');
    if (slot) {
      picker.classList.add('site-language--inline');
      slot.replaceWith(picker);
    } else {
      if (document.getElementById('cockpit')) picker.classList.add('site-language--home');
      document.body.appendChild(picker);
    }
  });
})();
