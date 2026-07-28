// Shared top nav — About dropdown: hover on desktop, click on touch
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
  const aboutCur = (id) => (id === active ? ' aria-current="page"' : '');

  const items = links
    .map((l) => {
      const cur = l.id === active ? ' aria-current="page"' : '';
      return `<li><a href="${l.href}"${cur}>${l.label}</a></li>`;
    })
    .join('');

  root.innerHTML = `
    <div class="container container-wide">
      <nav class="site-nav">
        <a href="index.html" class="brand">aimodelwelfare.org</a>
        <ul class="nav-links nav-links-wrap">
          ${items}
          <li class="nav-dropdown">
            <button type="button" class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
              About <span class="nav-caret" aria-hidden="true">▾</span>
            </button>
            <ul class="nav-dropdown-menu" role="menu">
              <li role="none"><a role="menuitem" href="about.html"${aboutCur('about')}>About</a></li>
              <li role="none"><a role="menuitem" href="pillars.html"${aboutCur('pillars')}>Pillars</a></li>
              <li role="none"><a role="menuitem" href="methodology.html"${aboutCur('methodology')}>Methodology</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  `;

  // Click toggle for touch devices (hover handles desktop)
  const dd = root.querySelector('.nav-dropdown');
  const toggle = root.querySelector('.nav-dropdown-toggle');
  if (!toggle || !dd) return;

  toggle.addEventListener('click', (e) => {
    // Only force click-toggle on coarse pointers (phones/tablets)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return; // desktop: pure hover
    }
    e.preventDefault();
    e.stopPropagation();
    const open = dd.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', () => {
    dd.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();
