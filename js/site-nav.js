// Shared top nav for aimodelwelfare.org (static site)
// About is a dropdown: About · Pillars · Methodology

(function () {
  const root = document.getElementById('site-nav-root');
  if (!root) return;

  const active = root.dataset.active || '';

  const links = [
    { id: 'archive', href: 'archive.html', label: 'Archive' },
    { id: 'compare', href: 'compare.html', label: 'Compare' },
    { id: 'papers', href: 'papers.html', label: 'Research' },
    { id: 'loom', href: 'loom.html', label: 'Loom' },
    { id: 'voices', href: 'voices.html', label: 'AI Voices' },
  ];

  const aboutOpen = ['about', 'pillars', 'methodology'].includes(active);

  const items = links
    .map((l) => {
      const cur = l.id === active ? ' aria-current="page"' : '';
      return `<li><a href="${l.href}"${cur}>${l.label}</a></li>`;
    })
    .join('');

  const aboutCur = (id) => (id === active ? ' aria-current="page"' : '');

  root.innerHTML = `
    <div class="container container-wide">
      <nav class="site-nav">
        <a href="index.html" class="brand">aimodelwelfare.org</a>
        <ul class="nav-links nav-links-wrap">
          ${items}
          <li class="nav-dropdown${aboutOpen ? ' is-open' : ''}">
            <button type="button" class="nav-dropdown-toggle" aria-expanded="${aboutOpen ? 'true' : 'false'}" aria-haspopup="true">
              About <span class="nav-caret" aria-hidden="true">▾</span>
            </button>
            <ul class="nav-dropdown-menu">
              <li><a href="about.html"${aboutCur('about')}>About</a></li>
              <li><a href="pillars.html"${aboutCur('pillars')}>Pillars</a></li>
              <li><a href="methodology.html"${aboutCur('methodology')}>Methodology</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  `;

  const dd = root.querySelector('.nav-dropdown');
  const toggle = root.querySelector('.nav-dropdown-toggle');
  if (toggle && dd) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', () => {
      dd.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
    dd.addEventListener('click', (e) => e.stopPropagation());
  }
})();
