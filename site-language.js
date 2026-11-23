(function () {
  const current = new URL(location.href);
  const requested = current.searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem('portfolio-language'); } catch {}
  let language = requested === 'zh' || requested === 'en' ? requested : saved === 'zh' ? 'zh' : 'en';
  let desiredLanguage = language;
  let activeTransition = null;
  let picker = null;
  const originals = new WeakMap();
  const attributes = ['alt', 'aria-label', 'aria-description', 'title', 'placeholder', 'data-label', 'data-lightbox-alt'];

  document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';

  function url(href, targetLanguage = language) {
    const destination = new URL(href, location.href);
    destination.searchParams.set('lang', targetLanguage);
    return destination.href;
  }

  function text(english, translation) {
    return language === 'zh' ? translation : english;
  }

  function original(element) {
    if (!originals.has(element)) originals.set(element, { children: null, attributes: {} });
    return originals.get(element);
  }

  function applyLanguage(nextLanguage, initial) {
    const previousLanguage = language;
    const { scrollX, scrollY } = window;
    language = nextLanguage;
    const chinese = language === 'zh';
    document.documentElement.lang = chinese ? 'zh-Hans' : 'en';
    if (document.documentElement.hasAttribute('xml:lang')) {
      document.documentElement.setAttribute('xml:lang', document.documentElement.lang);
    }
    try { localStorage.setItem('portfolio-language', language); } catch {}

    document.querySelectorAll('[data-zh]').forEach(function (element) {
      const saved = original(element);
      if (!saved.children) saved.children = Array.from(element.childNodes, node => node.cloneNode(true));
      if (chinese) element.textContent = element.dataset.zh;
      else if (!initial) {
        if (element.hasAttribute('data-en')) element.textContent = element.dataset.en;
        else element.replaceChildren(...saved.children.map(node => node.cloneNode(true)));
      }
    });

    for (const attribute of attributes) {
      document.querySelectorAll('[data-zh-' + attribute + ']').forEach(function (element) {
        const saved = original(element).attributes;
        if (!(attribute in saved)) saved[attribute] = element.getAttribute(attribute);
        const english = element.getAttribute('data-en-' + attribute) ?? saved[attribute];
        const value = chinese ? element.getAttribute('data-zh-' + attribute) : english;
        if (value === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, value);
      });
    }

    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.closest('.site-language')) return;
      const destination = new URL(href, location.href);
      if (destination.origin === location.origin && /\.html$/i.test(destination.pathname)) {
        link.href = url(destination);
      }
    });

    if (picker) {
      picker.setAttribute('aria-label', text('Page language', '页面语言'));
      picker.querySelectorAll('[data-language]').forEach(function (link) {
        link.href = url(location.href, link.dataset.language);
        if (link.dataset.language === language) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }

    if (!initial) {
      history.replaceState(history.state, '', url(location.href));
      document.dispatchEvent(new CustomEvent('site-language-change', {
        detail: { language, previousLanguage }
      }));
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
    }
  }

  function setLanguage(nextLanguage) {
    if ((nextLanguage !== 'en' && nextLanguage !== 'zh') || nextLanguage === desiredLanguage) return;
    desiredLanguage = nextLanguage;
    if (activeTransition) activeTransition.skipTransition();
    function update() {
      if (language !== desiredLanguage) applyLanguage(desiredLanguage, false);
    }
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }
    const transition = document.startViewTransition(update);
    activeTransition = transition;
    transition.ready.catch(function () {});
    transition.finished.then(function () {
      if (activeTransition === transition) activeTransition = null;
    });
  }

  window.SiteLanguage = { text, url, setLanguage };

  document.addEventListener('DOMContentLoaded', function () {
    applyLanguage(language, true);
    picker = document.createElement('nav');
    picker.className = 'site-language';
    picker.setAttribute('aria-label', text('Page language', '页面语言'));
    for (const [code, label, lang] of [['en', 'English', 'en'], ['zh', '中文', 'zh-Hans']]) {
      const link = document.createElement('a');
      link.href = url(location.href, code);
      link.lang = lang;
      link.hreflang = lang;
      link.dataset.language = code;
      link.textContent = label;
      if (code === language) link.setAttribute('aria-current', 'page');
      link.addEventListener('click', function (event) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setLanguage(code);
      });
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
